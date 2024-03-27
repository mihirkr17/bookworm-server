const { Schema, model } = require("mongoose");

const articlesSchema = new Schema({
   title: { type: String, required: [true, "Required article title!"] },
   authorId: { type: Schema.Types.ObjectId, ref: "USERS_TBL" },
   status: { type: String, enum: ["published", "unpublished"], default: "unpublished" },
   thumbnail: { type: String },
   content: { type: String },
   metaDescription: { type: String },
   keywords: { type: Array },
   views: Number,
   articlePublishedAt: { type: Date },
   articleCreatedAt: { type: Date },
   articleModifiedAt: { type: Date }
});



module.exports = model("ARTICLES_TBL", articlesSchema, "ARTICLES_TBL");