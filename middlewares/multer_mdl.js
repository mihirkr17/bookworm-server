const multer = require("multer");
const path = require("path");


function uploadBookAsCsv() {
   const storage = multer.diskStorage({
      destination: function (req, file, cb) {
         return cb(null, path.resolve(__dirname, "../temp"));
      },
      filename: function (req, file, cb) {

         if (!file.originalname) return cb(new Error("No csv found!"));

         const uniqueSuffixName =
            Date.now() + "-" + Math.round(Math.random() * 1e9);

         cb(
            null,
            file.fieldname +
            "_" +
            uniqueSuffixName +
            path.extname(file.originalname)
         );
      }
   });

   return multer({ storage });
}


function thumbnailUploader() {
   const storage = multer.diskStorage({
      destination: function (req, file, cb) {
         return cb(null, path.resolve(__dirname, "../public/images/"));
      },
      filename: function (req, file, cb) {

         const uniqueSuffixName =
            Date.now() + "-" + Math.round(Math.random() * 1e9);

         cb(
            null,
            file.fieldname +
            "_" +
            uniqueSuffixName +
            path.extname(file.originalname)
         );
      }
   });

   return multer({ storage });
}


module.exports = { uploadBookAsCsv, thumbnailUploader };