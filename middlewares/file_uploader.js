const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = require("../configs/constant");

// Cloudinary Config
cloudinary.config({
   cloud_name: CLOUDINARY_CLOUD_NAME,
   api_key: CLOUDINARY_API_KEY,
   api_secret: CLOUDINARY_API_SECRET
});


// Cloudinary Storage Initialized Here...
const ArticleThumbnailStorage = new CloudinaryStorage({
   cloudinary,
   params: {
      folder: "bucket/articles",
      resource_type: "auto",
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"]
   }
});

const BookThumbnailStorage = new CloudinaryStorage({
   cloudinary,
   params: {
      folder: "bucket/books",
      resource_type: "auto",
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"]
   }
});

const AvatarStorage = new CloudinaryStorage({
   cloudinary,
   params: {
      folder: "bucket/avatars",
      resource_type: "auto",
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"]
   }
})

// Upload Middlewares
const articleThumbUploader = multer({ storage: ArticleThumbnailStorage }).single("thumbnail");
const bookThumbUploader = multer({ storage: BookThumbnailStorage }).single("thumbnail");
const avatarUploader = multer({ storage: AvatarStorage }).single("avatar");


module.exports = { articleThumbUploader, bookThumbUploader, avatarUploader };