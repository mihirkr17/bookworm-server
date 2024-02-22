const { Schema, model } = require("mongoose");

const articlesSchema = new Schema({
   title: { type: String, required: [true, "Required article title!"] },
   authorId: { type: Schema.Types.ObjectId, ref: "USERS_TBL" },
   thumbnail: { type: String },
   content: { type: String },
   metaDescription: { type: String },
   keywords: { type: Array },
   views: Number,
   articleCreatedAt: { type: Date },
   articleModifiedAt: { type: Date }
});



module.exports = model("ARTICLES_TBL", articlesSchema, "ARTICLES_TBL");