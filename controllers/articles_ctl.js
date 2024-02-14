const { ObjectId } = require("mongodb");
const ARTICLES_TBL = require("../models/ARTICLES_TBL");
const { Success, Error400 } = require("../responser/response");
const validator = require("validator");

/**
 * [Create Article By Editor]
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function createArticle(req, res, next) {
   try {
      const { _id } = req?.decoded;

      const { title, content } = req?.body;
      const thumbnailFile = req?.file;

      if (!content || !title) throw new Error400("Required content and title!");

      await new ARTICLES_TBL({
         title: validator.escape(title),
         content,
         authorId: _id,
         thumbnail: thumbnailFile ? "/images/" + thumbnailFile?.filename : null,
         articleCreatedAt: new Date(Date.now())
      }).save();

      return new Success(res, {
         message: "Article added successfully."
      });

   }
   catch (err) {
      next(err);
   }
}


/**
 * [Delete Article By ID In Editor Dashboard]
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function deleteArticleById(req, res, next) {
   try {

      const { articleId } = req?.params;
      const { _id } = req?.decoded;

      if (!articleId || !ObjectId.isValid(articleId)) throw new Error400(`Invalid article id in the params!`);

      //   const result =  await ARTICLES_TBL.findOneAndDelete({ $and: [{ _id: new ObjectId(articleId) }, { authorId: new ObjectId(_id) }] });
      const result = await ARTICLES_TBL.findOneAndDelete({ _id: new ObjectId(articleId) });

      if (!result) throw new Error400(`Permission denied!`);

      return new Success(res, {
         message: `Article with ${articleId} deleted.`
      });

   } catch (error) {
      next(error);
   }
}


/**
 * {Show All Articles In The Editor Dashboard}
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @query [sort]
 * @returns 
 */
async function showAllArticles(req, res, next) {

   const { q, sort = "newest", page = 1, limits = 10, action } = req?.query;

   let searchQuery = {};


   // search query
   if (q) {
      // Sanitize the search query
      let newQ = validator.escape(q).trim();
      searchQuery = { title: { $regex: newQ, $options: 'si' } }
   }


   let sortQuery = {};

   if (sort === "oldest") {
      sortQuery = {
         _id: 1
      }
   } else if (sort === "asc") {
      sortQuery = {
         title: 1
      }
   } else if (sort === "dsc") {
      sortQuery = {
         title: -1
      }
   } else {
      sortQuery = { _id: -1 };
   }

   const skip = Math.ceil((parseInt(page) - 1) * parseInt(limits));

   try {

      let searchStructure = [
         { $match: searchQuery },
         {
            $lookup: {
               from: "USERS_TBL",
               let: { userId: "$authorId" },
               pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                  {
                     $project: {
                        authorName: { $concat: ["$firstName", " ", "$lastName"] },
                        _id: 0
                     }
                  }
               ],
               as: "authorAcc"
            }
         },
         {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$authorAcc", 0] }, "$$ROOT"] } }
         },
         {
            $unset: ["authorAcc"]
         }, {
            $sort: sortQuery
         },
      ]

      const allArticles = await ARTICLES_TBL.aggregate([
         {
            $facet: {
               totalArticlesCount: [...searchStructure, { $count: 'number' }],
               searchedArticles: [...searchStructure, { $skip: skip }, { $limit: parseInt(limits) }]
            }
         }
      ]);

      return new Success(res, {
         data: {
            searchResults: allArticles[0] || {}
         }
      })

   } catch (error) {
      next(error);
   }
}



/**
 * [Modify Article by Editor Dashboard]
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function modifyArticle(req, res, next) {
   try {
      const { articleId } = req?.params;

      const { _id } = req?.decoded;

      const { content, title } = req?.body;

      const thumbnailFile = req?.file;

      if (!content || !title) throw new Error400("Required content and title!");

      if (!articleId || !ObjectId.isValid(articleId)) throw new Error400(`Invalid article id in the params!`);

      const article = await ARTICLES_TBL.findOne({ $and: [{ _id: new ObjectId(articleId) }, { authorId: new ObjectId(_id) }] });

      Object.assign(article, {
         content,
         title,
         thumbnail: thumbnailFile?.filename ? "/images/" + thumbnailFile?.filename : article?.thumbnail
      });

      await article.save();

      return new Success(res, {
         message: `Article with id ${articleId} updated successfully.`
      })
   } catch (error) {
      next(error);
   }
}



/**
 * [Get Article By Id]
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function getArticleById(req, res, next) {
   try {
      const { articleId } = req?.params;

      if (!articleId || !ObjectId.isValid(articleId)) throw new Error400("Invalid article id in the params!");

      const article = await ARTICLES_TBL.aggregate([
         { $match: { _id: new ObjectId(articleId) } },
         {
            $lookup: {
               from: "USERS_TBL",
               let: { userId: "$authorId" },
               pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                  {
                     $project: {
                        authorName: { $concat: ["$firstName", " ", "$lastName"] },
                        _id: 0
                     }
                  }
               ],
               as: "authorAcc"
            }
         },
         {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$authorAcc", 0] }, "$$ROOT"] } }
         },
         {
            $unset: ["authorAcc"]
         }
      ]);

      return new Success(res, {
         data: {
            article: Array.isArray(article) ? article[0] : {}
         }
      })

   } catch (error) {
      next(error);
   }
}



async function homeArticle(req, res, next) {
   try {
      const article = await ARTICLES_TBL.aggregate([
         {
            $lookup: {
               from: "USERS_TBL",
               let: { userId: "$authorId" },
               pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                  {
                     $project: {
                        authorName: { $concat: ["$firstName", " ", "$lastName"] },
                        _id: 0
                     }
                  }
               ],
               as: "authorAcc"
            }
         },
         {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$authorAcc", 0] }, "$$ROOT"] } }
         },
         {
            $unset: ["authorAcc"]
         },{
            $limit: 3
         }
      ]);// find({}).limit(3);


      return new Success(res, {
         data: {
            articles: article || []
         }
      });
   } catch (error) {
      next(error)
   }
}

module.exports = {
   createArticle,
   deleteArticleById,
   showAllArticles,
   modifyArticle,
   getArticleById,
   homeArticle
}