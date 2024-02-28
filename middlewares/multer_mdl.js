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


function editorAvatarUploader() {

   const storage = multer.diskStorage({
      destination: function (req, file, cb) {
         return cb(null, path.resolve(__dirname, "../public/avatar/"));
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

   return multer({
      storage, fileFilter: (req, file, cb) => {
         const filetypes = /jpeg|jpg|png|gif/;
         // Check ext
         const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
         // Check mime
         const mimetype = filetypes.test(file.mimetype);

         if (!file.originalname) {
            return cb(new Error('file is not allowed'))
         } else if (!mimetype || !extname) {
            return cb(new Error('file is not allowed'));
         } else {
            return cb(null, true);
         }
      }
   });
}


module.exports = { uploadBookAsCsv, thumbnailUploader, editorAvatarUploader };