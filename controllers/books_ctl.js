const { readCsvFile } = require("../utils/csv_reader");
const BOOKS_TBL = require("../models/BOOKS_TBL");
const BOOKS_READ_TBL = require("../models/BOOKS_READ_TBL");
const BOOKS_RATING_TBL = require("../models/BOOKS_RATING_TBL");
const BOOKS_COMMENT_TBL = require("../models/BOOKS_COMMENT_TBL");
const { Success, Error400, Error404, Error503 } = require("../responser/response");
const { ObjectId } = require("mongodb");
const { BOOKS_READ_STATUS, ROLES, BOOK_CATEGORIES } = require("../configs/constant");
const validator = require('validator');
const { calculateAverageRatings } = require("../utils/calc");
const fsPromises = require("fs/promises");


// utils 

function bookInputDataValidation(body) {
   const { title, isbn, authors, categories, publishedYear, numberPages, description, subTitle } = body;

   if (!title) {
      throw new Error400("Required book title!");
   }

   if (!isbn) throw new Error400("Required isbn number of this book!")

   if (!publishedYear) throw new Error400("Required book published year!");

   const currentYear = new Date().getFullYear();

   if (!(publishedYear >= 1900 && publishedYear <= currentYear)) {
      throw new Error400('Invalid year. Please enter a year between 1900 and the current year.');
   }

   return {
      title, isbn: parseInt(isbn), authors, categories,
      publishedYear: parseInt(publishedYear), numberPages: parseInt(numberPages), description, subTitle
   };
}

function removeQuotes(str) {
   // if (typeof str === 'string' && str.length >= 1 && (
   //    (str.charAt(0) === '"' && str.charAt(str.length - 1) === '"') ||
   //    (str.charAt(0) === "'" && str.charAt(str.length - 1) === "'")
   // )) {
   //    return str.slice(1, -1);
   // }
   // return str;

   if (typeof str === 'string' && str.length >= 1) {
      const quotesPattern = /^['"]|['"]$/g;

      // Replace the first and last occurrence of quotes with an empty string
      return str.replace(quotesPattern, '');
   }

   return str;
}


/**
 * [Added BOOKS_TBL By CSV Bulk]
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function addBookByCSV(req, res, next) {
   try {
      const csvPath = req?.file?.path;
      const { _id } = req?.decoded;

      if (!csvPath) throw new Error404("Sorry csv not found!")

      const [keys, ...rest] = await readCsvFile(csvPath);
      const formedArr = rest && rest.map((item) => {
         const object = {};
         keys.forEach((key, index) => (object[key] = item.at(index)));
         return object;
      });


      if (formedArr) {

         let mapping = {
            isbn10: 'isbn',
            title: 'title',
            subTitle: 'subTitle',
            authors: 'authors',
            categories: 'categories',
            thumbnail: 'thumbnail',
            description: 'description',
            published_year: 'publishedYear',
            num_pages: 'numberPages'
         }

         let newArr = formedArr.map((item) => {
            const newObj = {};
            for (const oldKey in item) {
               const newKey = mapping[oldKey] || oldKey;


               if (newKey === "title") {

                  newObj[newKey] = removeQuotes(item[oldKey] || "");

               }

               newObj[newKey] = item[oldKey];
               newObj["creatorId"] = _id;
               newObj["ratings"] = {
                  "1": 0,
                  "2": 0,
                  "3": 0,
                  "4": 0,
                  "5": 0,
                  "6": 0,
                  "7": 0,
                  "8": 0,
                  "9": 0,
                  "10": 0
               },
                  newObj["bookCreatedAt"] = new Date(Date.now())
            }
            return newObj;
         });

         await BOOKS_TBL.insertMany(newArr);

         await fsPromises.unlink(csvPath);

         return new Success(res, {
            message: "Books added successfully.",
            data: {
               totalBookInserted: newArr.length
            }
         })
      }

   } catch (error) {
      next(error);
   }
}


/**
 * [Create Book By Single Inputs]
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function createBook(req, res, next) {
   try {
      const thumbnailFile = req?.file;
      const creator = req?.decoded?._id;

      if (!creator || !ObjectId.isValid(creator)) throw new Error503("Service unavailable !");

      const data = bookInputDataValidation(req?.body);

      Object.assign(data, {
         creatorId: creator,
         bookCreatedAt: new Date(Date.now()),
         thumbnail: "/images/" + thumbnailFile?.filename, ratings: {
            "1": 0,
            "2": 0,
            "3": 0,
            "4": 0,
            "5": 0,
            "6": 0,
            "7": 0,
            "8": 0,
            "9": 0,
            "10": 0
         }
      });

      // Added data to the book
      await new BOOKS_TBL(data).save();

      return new Success(res, {
         message: "Book added successfully."
      });
   } catch (error) {
      next(error);
   }
}


/**
 * [Modify Book Data By Editor Or User]
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function modifyBook(req, res, next) {
   try {

      const { _id, role } = req?.decoded;
      const { bookId } = req?.params;

      const thumbnailFile = req?.file;

      if (!bookId) throw new Error400('Required book id in the params!');

      if (!ObjectId.isValid(bookId))
         throw new Error400("Invalid book id!");


      const bookData = bookInputDataValidation(req?.body);

      let filterFor = role === ROLES?.user ? { $and: [{ _id: new ObjectId(bookId) }, { creatorId: new ObjectId(_id) }] } : { _id: new ObjectId(bookId) };

      const book = await BOOKS_TBL.findOne(filterFor);

      if (!book) throw new Error404("Book not found!");

      // assign new values
      Object.assign(book, {
         ...bookData,
         thumbnail: thumbnailFile?.filename ? "/images/" + thumbnailFile?.filename : book?.thumbnail,
         bookModifiedAt: new Date(Date.now())
      });

      await book.save();

      return new Success(res, {
         message: "Book successfully updated."
      })

   } catch (error) {
      next(error);
   }
}

/**
 * [Role === Editor]
 * [Delete Book By Editor In Dashboard Only]
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function deleteSingleBookById(req, res, next) {
   try {
      const { bookId } = req?.params;

      if (!bookId) throw new Error400('Required book id in the params!');

      if (!ObjectId.isValid(bookId))
         throw new Error400("Invalid book id!");



      await BOOKS_TBL.deleteOne({ _id: new ObjectId(bookId) });
      await BOOKS_COMMENT_TBL.deleteMany({ bookId: new ObjectId(bookId) });
      await BOOKS_RATING_TBL.deleteMany({ bookId: new ObjectId(bookId) });
      await BOOKS_READ_TBL.deleteMany({ bookId: new ObjectId(bookId) });

      return new Success(res, {
         message: `Book successfully deleted with id : ${bookId}`
      });

   } catch (error) {
      next(error);
   }
}




/**
 * [Role === User]
 * [User Can add books to read or to-read in Book Read Table]
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @params bookId
 * @query status
 */
async function addBookToTheReadCategory(req, res, next) {
   try {
      const { bookId } = req?.params;
      const { _id } = req?.decoded;
      const { status } = req?.body;
      let message = "";

      if (!Object.values(BOOKS_READ_STATUS).includes(status)) throw new Error400('Invalid book status value!');

      if (!bookId) throw new Error400('Required book id in the params!');

      if (!ObjectId.isValid(bookId))
         throw new Error400("Invalid book id!");


      const filterFor = { $and: [{ bookId: new ObjectId(bookId) }, { userId: new ObjectId(_id) }] };

      const bookReads = await BOOKS_READ_TBL.findOne(filterFor);

      if (bookReads) {
         bookReads.readStatus = status;
         await bookReads.save();
         message = `Book read status changed to ${status}`;
      } else {
         await new BOOKS_READ_TBL({
            bookId,
            userId: _id,
            readStatus: status,
            bookReadCreatedAt: new Date(Date.now())
         }).save();
         message = `Book added to ${status} successfully`;
      }

      return new Success(res, {
         message
      })

   } catch (error) {
      next(error);
   }
}


/**
 * all books from read category
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function showAllReadCategoryBooks(req, res, next) {
   try {

      const { _id } = req?.decoded;

      const readBooksData = await BOOKS_READ_TBL.aggregate([{
         $match: { userId: new ObjectId(_id) }
      },
      {
         $lookup: {
            from: "BOOKS_TBL",
            let: {
               bookId: "$bookId"
            },
            pipeline: [{ $match: { $expr: ["$_id", "$$bookId"] } }, {
               $project: {
                  title: 1, authors: 1, categories: 1, isbn: 1, _id: 0
               }
            }],
            as: "books"
         }
      },
      {
         $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$books", 0] }, "$$ROOT"] } }
      },
      {
         $unset: ["books"]
      }
      ]);


      return new Success(res, {
         data: {
            readBooksData: readBooksData || []
         }
      })

   } catch (error) {
      next(error);
   }
}



/**
 * Remove books from user read or to-read status
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function deleteReadCategoryBookById(req, res, next) {
   try {
      const { bookId } = req?.params;
      const { _id } = req?.decoded;

      if (!bookId || !ObjectId.isValid(bookId)) throw new Error400("Invalid book id in the params!");

      await BOOKS_READ_TBL.deleteOne({ $and: [{ userId: new ObjectId(_id) }, { bookId: new ObjectId(bookId) }] });

      return new Success(res, {
         message: "Book removed successfully."
      })
   } catch (error) {
      next(error);
   }
}



/**
 * [Rate book by user]
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @body {rating}
 * @params {bookId}
 * @returns 
 */
async function addRatingsForBook(req, res, next) {
   try {
      const { _id } = req?.decoded;
      const { bookId } = req?.params;
      const { rating } = req?.body;

      if (!bookId) throw new Error400('Required book id in the params!');

      if (!ObjectId.isValid(bookId))
         throw new Error400("Invalid book id!");

      if (typeof rating !== "number") throw new Error400('Rating points must be numbers!');

      if (!Array.from({ length: 10 }, (_, i) => i + 1).includes(rating)) throw new Error400("Invalid ratings point range!");

      const ratingExist = await BOOKS_RATING_TBL.findOne({ $and: [{ bookId: new ObjectId(bookId) }, { userId: new ObjectId(_id) }] });
      let book = await BOOKS_TBL.findOne({ _id: new ObjectId(bookId) });

      if (ratingExist) {
         book.ratings[`${ratingExist?.rating}`] = book.ratings[`${ratingExist?.rating}`] - 1;
         ratingExist.rating = rating;
         await ratingExist.save();
      }

      if (!book?.ratings) {
         book.ratings = {
            "1": 0,
            "2": 0,
            "3": 0,
            "4": 0,
            "5": 0,
            "6": 0,
            "7": 0,
            "8": 0,
            "9": 0,
            "10": 0
         }
      }

      book.ratings[`${rating}`] = book.ratings[`${rating}`] + 1;


      let ratingsObj = book?.ratings;

      const { averageRatings, totalRatingsCount } = calculateAverageRatings(ratingsObj);

      if (ratingExist) {
         Object.assign(book, { averageRatings, totalRatingsCount: book.totalRatingsCount });
      } else {
         Object.assign(book, { averageRatings, totalRatingsCount });

         const newRating = new BOOKS_RATING_TBL({
            userId: _id,
            bookId,
            rating: parseInt(rating),
            ratingCreatedAt: new Date(Date.now())
         });

         await newRating.save();
      }

      await book.save();

      return new Success(res, {
         message: "Thanks for rating."
      });
   } catch (error) {
      next(error);
   }
}


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function getAllBooksBySearchOrNotSearchSystem(req, res, next) {
   try {

      const { action, q = "", sort = "", year, page = 1, pageSize = 10, ctg = "" } = req?.query;

      const decoded = req?.decoded;

      let forUserBooks = {};
      if (decoded?._id && decoded?.role === "User") {
         forUserBooks = {
            creatorId: new ObjectId(decoded?._id)
         }
      }
      // search query
      let searchQuery = {};
      if (q) {
         // Sanitize the search query
         let newQ = validator.escape(q).trim();

         searchQuery = {
            $or: [
               { title: { $regex: newQ, $options: 'si' } },
               { authors: { $regex: newQ, $options: 'si' } }
            ]
         };
      }

      // filter by publication year
      let yearQuery = (year && year !== "") ? { publishedYear: parseInt(year) } : {};


      // sorting query
      let sortQuery = {};
      if (sort === "asc") {
         sortQuery = {
            title: 1
         }
      } else if (sort === "dsc") {
         sortQuery = {
            title: -1
         }
      } else if (sort === "highest_rated") {
         sortQuery = {
            totalRatingsCount: -1
         }
      } else if (sort === "lowest_rated") {
         sortQuery = {
            totalRatingsCount: 1
         }
      } else {
         sortQuery = {
            _id: -1
         }
      }

      let categoryQuery = {};

      if (ctg) {
         let categories = ctg.split(",");
         const categoriesRegex = categories && categories.map(category => new RegExp(category, 'i'));
         categoryQuery = {
            categories: { $in: categoriesRegex }
         }
      }

      // Pagination 
      const skip = Math.ceil((parseInt(page) - 1) * parseInt(pageSize));

      let project = {
         title: 1,
         subTitle: 1,
         thumbnail: 1,
         authors: 1,
         categories: 1,
         bookCreatedAt: 1,
         totalRatingsCount: 1,
         averageRatings: 1,
         publishedYear: 1
      }

      let searchStructure = [
         {
            $project: project
         },
         { $match: searchQuery },
         { $set: { searchIndex1: "1" } },
         { $match: categoryQuery },
         { $set: { searchIndex2: "2" } },
         { $match: yearQuery }
      ]

      let mainFacet = {
         totalBooksCount: [...searchStructure, { $count: 'number' }],
         allCategories: [{ $project: { categories: 1, _id: false } }, { $group: { _id: "$categories" } }]
      };

      if (action === "true") {
         mainFacet["newestBooks"] = [{ $project: project }, { $sort: { _id: -1 } }, { $limit: 6 }];
         mainFacet["highestRatedBooks"] = [{ $project: project }, { $sort: { totalRatingsCount: -1 } }, { $limit: 6 }]
      } else {
         mainFacet["searchedBooks"] = [...searchStructure, { $sort: sortQuery }, { $skip: skip },
         { $limit: parseInt(pageSize) }];
      }


      // Actual operation
      const searchedBooks = await BOOKS_TBL.aggregate([
         { $match: forUserBooks },
         {
            $facet: mainFacet
         }
      ]);

      return new Success(res, {
         data: {
            searchResults: searchedBooks[0] || {}
         }
      });

   } catch (error) {
      next(error);
   }
}


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function getSingleBookDataById(req, res, next) {
   try {
      const { bookId } = req?.params;

      if (!bookId) throw new Error400('Required book id in the params!');

      if (!ObjectId.isValid(bookId))
         throw new Error400("Invalid book id!");

      const userId = req?.decoded?._id;

      let filters = [{ $match: { _id: new ObjectId(bookId) } }, {
         $lookup: {
            from: "BOOKS_COMMENT_TBL",
            let: { mainBookId: "$_id" },
            pipeline: [
               { $match: { $expr: { $eq: ["$bookId", "$$mainBookId"] } } },
               {
                  $facet: {
                     totalCommentsCount: [{ $count: 'number' }],
                     commentsAll: [{
                        $lookup: {
                           from: "USERS_TBL",
                           let: { uId: "$userId" },
                           pipeline: [
                              { $match: { $expr: { $eq: ["$_id", "$$uId"] } } },
                              {
                                 $project: {
                                    commentAuthorName: { $concat: ["$firstName", " ", "$lastName"] }
                                 }
                              }
                           ],
                           as: "commentUser"
                        }
                     },
                     {
                        $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$commentUser", 0] }, "$$ROOT"] } }
                     },
                     {
                        $project: { bookId: 0, reports: 0, __v: 0 }
                     },
                     {
                        $unset: ["commentUser"]
                     },
                     {
                        $sort: { _id: -1 }
                     },
                     {
                        $limit: 10
                     }]
                  }
               },

            ],
            as: "comments"
         }
      }, {
         $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$comments", 0] }, "$$ROOT"] } }
      },
      {
         $unset: ["ratings", "comments"]
      }];

      if (userId && ObjectId.isValid(userId)) {
         filters.push({
            $lookup: {
               from: "BOOKS_RATING_TBL",
               let: { mainBookId: "$_id" },
               pipeline: [
                  { $match: { $expr: { $eq: ["$bookId", "$$mainBookId"] } } },
                  {
                     $project: { ratingUserId: "$userId", ratingUserValue: "$rating", _id: 0 }
                  }, {
                     $match: {
                        ratingUserId: new ObjectId(userId)
                     }
                  }
               ],
               as: "ratingsUser"
            }
         }, { $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$ratingsUser", 0] }, "$$ROOT"] } } }, { $unset: "ratingsUser" })
      }

      const book = await BOOKS_TBL.aggregate(filters);

      return new Success(res, {
         data: {
            book: book ? book[0] : {}
         }
      })

   } catch (error) {
      next(error);
   }
}



/**
 * [Insert Comment for books]
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function addCommentsForBook(req, res, next) {
   try {
      const { _id, fullName = "unknown" } = req?.decoded;
      const { bookId } = req?.params;


      if (!bookId || !ObjectId.isValid(bookId))
         throw new Error400("Invalid book id!");


      const { content } = req?.body;

      if (!content) throw new Error400("Write something about this book.");

      // Inserting comment Data
      await new BOOKS_COMMENT_TBL({
         content: validator.escape(content),
         author: fullName,
         bookId, userId: _id,
         commentCreatedAt: new Date(Date.now())
      }).save();

      return new Success(res, {
         message: "Thanks for comment."
      })

   } catch (error) {
      next(error);
   }
}


/**
 * [Role === Editor]
 * [Show all book comments in the editor dashboard only]
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function showAllBooksCommentsInDashboard(req, res, next) {
   try {

      const page = req?.query?.page || 1;
      const limit = req?.query?.limit || 10;

      // Pagination 
      const skip = Math.ceil((parseInt(page) - 1) * parseInt(limit));

      const comments = await BOOKS_COMMENT_TBL.find({}).sort({ reportsCount: -1 }).skip(skip).limit(parseInt(limit));
      const totalCommentsCount = await BOOKS_COMMENT_TBL.countDocuments({});
      return new Success(res, {
         data: {
            comments: comments || [],
            totalCommentsCount: totalCommentsCount || 0
         }
      })

   } catch (error) {
      next(error);
   }
}

/**
 * [Role === Editor]
 * [Delete comment by comment id]
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function deleteBooksCommentByIdInDashboard(req, res, next) {
   try {
      const { commentId } = req?.params;

      if (!commentId || !ObjectId.isValid(commentId)) throw new Error400("Invalid comment id!");

      await BOOKS_COMMENT_TBL.deleteOne({ _id: new ObjectId(commentId) });

      return new Success(res, {
         message: `Comment with id ${commentId} deleted successfully.`
      })

   } catch (error) {
      next(error);
   }
}


/**
 * Report Comment
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function reportBooksComment(req, res, next) {
   try {
      const { commentId } = req?.params;

      const { _id: reportId } = req?.decoded;

      if (!commentId || !ObjectId.isValid(commentId)) throw new Error400("Invalid comment id!");
      if (!reportId || !ObjectId.isValid(reportId)) throw new Error400("Invalid reportId id!");

      let comment = await BOOKS_COMMENT_TBL.findOne({ _id: new ObjectId(commentId) });

      if (!comment) throw new Error404("Sorry comment not fount!");

      // Checking if this comment for report user
      if (new ObjectId(comment?.userId).toString() === reportId) throw new Error400("You can not report your own comment!");

      const reports = comment?.reports || [];

      if (reports.includes(reportId)) throw new Error400("You already report this comment!");

      reports.push(reportId);

      let reportsCount = reports.length;

      // Inserting reports
      comment.reports = reports;
      comment.reportsCount = reportsCount;
      comment.suspicious = reportsCount >= 3 ? true : false;

      await comment.save();

      return new Success(res, {
         message: "Report done."
      });
   } catch (error) {
      next(error);
   }
}


async function myBookSelfBooks(req, res, next) {
   try {
      const { _id } = req?.decoded;


      let bookTbl = {
         $lookup: {
            from: "BOOKS_TBL",
            let: { mainBookId: "$bookId" },
            pipeline: [
               {
                  $match: {
                     $expr:
                        { $eq: ["$_id", "$$mainBookId"] }
                  }
               },
               {
                  $project: { description: 0, creatorId: 0, reports: 0, __v: 0, bookId: 0, ratings: 0 }
               }
            ],
            as: "books"
         }

      }


      const ratedBooks = await BOOKS_RATING_TBL.aggregate([
         { $match: { userId: new ObjectId(_id) } },
         bookTbl,
         {
            $unset: ["_id"]
         },
         {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$books", 0] }, "$$ROOT"] } }
         },
         {
            $unset: ["books", "bookId"]
         }
      ]);

      const readBooks = await BOOKS_READ_TBL.aggregate([
         { $match: { userId: new ObjectId(_id) } },
         bookTbl,
         { $match: { readStatus: "read" } },
         {
            $unset: ["_id"]
         },
         {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$books", 0] }, "$$ROOT"] } }
         },
         {
            $unset: ["books", "bookId"]
         }
      ]);

      // to-read
      const unreadBooks = await BOOKS_READ_TBL.aggregate([
         { $match: { userId: new ObjectId(_id) } },
         bookTbl,
         { $match: { readStatus: "to-read" } },
         {
            $unset: ["_id"]
         },
         {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$books", 0] }, "$$ROOT"] } }
         },
         {
            $unset: ["books", "bookId"]
         }
      ]);


      return new Success(res, {
         data: {
            ratedBooks: ratedBooks || [],
            unreadBooks: unreadBooks || [],
            readBooks: readBooks || []
         }
      })


   } catch (error) {
      next(error)
   }
}


async function getAllBooksCategories(req, res, next) {
   try {

      const categories = await BOOKS_TBL.aggregate([
         {
            $project: {
               categories: 1,
               _id: 0
            }
         },
         {
            $group: {
               _id: "$categories"
            }
         }
      ]);


      return new Success(res, {
         data: {
            categories: categories || []
         }
      })
   } catch (error) {
      next(error);
   }
}


async function deleteOwnComments(req, res, next) {
   try {
      const commentId = req?.params?.commentId;
      const bookId = req?.params?.bookId;
      const userId = req?.decoded?._id;

      if (!commentId || !ObjectId.isValid(commentId)) throw new Error400("Invalid comment id!");

      if (!bookId || !ObjectId.isValid(bookId)) throw new Error400("Invalid book id!");

      const result = await BOOKS_COMMENT_TBL.findOneAndDelete({
         $and: [
            { _id: new ObjectId(commentId) },
            { bookId: new ObjectId(bookId) },
            { userId: new ObjectId(userId) }
         ]
      });


      if (!result) {
         throw new Error404("Comment not found!");
      }
      return new Success(res, {
         message: "Comment deleted."
      })
   } catch (error) {
      next(error);
   }
}


async function showAllComments(req, res, next) {
   try {
      const bookId = req?.params?.bookId;

      if (!bookId || !ObjectId.isValid(bookId)) throw new Error400("Invalid book id!");

      const comments = await BOOKS_COMMENT_TBL.aggregate([
         { $match: { bookId: new ObjectId(bookId) } },
         {
            $lookup: {
               from: "USERS_TBL",
               let: { uId: "$userId" },
               pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$uId"] } } },
                  {
                     $project: {
                        commentAuthorName: { $concat: ["$firstName", " ", "$lastName"] }
                     }
                  }
               ],
               as: "commentUser"
            }
         },
         {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$commentUser", 0] }, "$$ROOT"] } }
         },
         {
            $project: { bookId: 0, reports: 0, __v: 0 }
         },
         {
            $unset: ["commentUser"]
         },
         {
            $sort: { _id: -1 }
         }
      ]);

      return new Success(res, {
         data: {
            comments: comments || []
         }
      })
   } catch (error) {
      next(error);
   }
}
module.exports = {
   addBookByCSV,
   createBook,
   modifyBook,
   deleteSingleBookById,
   addBookToTheReadCategory,
   showAllReadCategoryBooks,
   deleteReadCategoryBookById,
   myBookSelfBooks,
   addRatingsForBook,
   getAllBooksBySearchOrNotSearchSystem,
   getSingleBookDataById,
   addCommentsForBook,
   reportBooksComment,
   showAllBooksCommentsInDashboard,
   deleteBooksCommentByIdInDashboard,
   getAllBooksCategories,
   deleteOwnComments,
   showAllComments
}