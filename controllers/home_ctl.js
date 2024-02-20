const { Success } = require("../responser/response");
const BOOKS_TBL = require("../models/BOOKS_TBL");
const ARTICLES_TBL = require("../models/ARTICLES_TBL");

async function homeOverview(req, res, next) {
   try {

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

      // Actual operation
      const searchedBooks = await BOOKS_TBL.aggregate([
         {
            $facet: {
               newestBooks: [{ $project: project }, { $sort: { _id: -1 } }, { $limit: 6 }],
               highestRatedBooks: [{ $project: project }, { $sort: { totalRatingsCount: -1 } }, { $limit: 6 }]
            }
         }
      ]);

      const firstArticle = await ARTICLES_TBL.aggregate([
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
            $limit: 1
         }
      ]);


      return new Success(res, {
         data: {
            searchResults: searchedBooks[0] || {},
            article: firstArticle[0] || {}
         }
      })
   } catch (error) {
      next(error);
   }
}

module.exports = {
   homeOverview
}