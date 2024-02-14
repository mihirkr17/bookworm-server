const { Schema, model } = require("mongoose");

module.exports = model("BOOKS_RATING_TBL", new Schema({
   rating: { type: Number, required: [true, "Required rating points!"] },
   bookId: { type: Schema.Types.ObjectId, ref: "BOOKS_TBL" },
   userId: { type: Schema.Types.ObjectId, ref: "USERS_TBL" },
   ratingCreatedAt: { type: Date }
}), "BOOKS_RATING_TBL")