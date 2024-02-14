const { Schema, model } = require("mongoose");

module.exports = model("BOOKS_READ_TBL", new Schema({
   bookId: { type: Schema.Types.ObjectId, ref: "BOOKS_TBL" },
   userId: { type: Schema.Types.ObjectId, ref: "USERS_TBL" },
   readStatus: { type: String, enum: ["to-read", "read"] },
   bookReadCreatedAt: { type: Date}
}), "BOOKS_READ_TBL")