const { Schema, model } = require("mongoose");
const { BOOK_CATEGORIES } = require("../configs/constant");



const bookSchema = new Schema({
   title: { type: String, required: [true, "Required book title!"] },
   subTitle: { type: String },
   isbn: { type: String, unique: false },
   authors: { type: String },
   thumbnail: { type: String },
   description: { type: String },
   publishedYear: { type: Number },
   categories: {
      type: String
   },
   numberPages: { type: Number },
   creatorId: { type: Schema.Types.ObjectId, ref: "USERS_TBL" },
   ratings: {
      "1": Number,
      "2": Number,
      "3": Number,
      "4": Number,
      "5": Number,
      "6": Number,
      "7": Number,
      "8": Number,
      "9": Number,
      "10": Number
   },
   averageRatings: Number,
   totalRatingsCount: Number,
   bookCreatedAt: { type: Date, default: Date.now() },
   bookModifiedAt: { type: Date }
});


module.exports = model("BOOKS_TBL", bookSchema, "BOOKS_TBL");