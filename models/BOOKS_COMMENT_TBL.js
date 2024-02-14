const { Schema, model } = require("mongoose");


module.exports = model("BOOKS_COMMENT_TBL", new Schema({
   userId: { type: Schema.Types.ObjectId, ref: "USERS_TBL" },
   bookId: { type: Schema.Types.ObjectId, ref: "BOOKS_TBL" },
   author: { type: String },
   content: { type: String },
   reports: Array,
   reportsCount: { type: Number, default: 0 },
   suspicious: Boolean,
   commentCreatedAt: { type: Date }
}), "BOOKS_COMMENT_TBL")