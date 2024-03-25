const AUTH_SECRET = process.env.AUTH_SECRET_CODE;
const MONGO_URI = process.env.MONGO_URI;

const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;

const ROLES = {
   user: "User",
   editor: "Editor"
}

const BOOK_CATEGORIES = [
   "Fiction",
   "Mystery",
   "Thriller",
   "Romance",
   "Science Fiction",
   "Fantasy",
   "Horror",
   "Historical Fiction",
   "Adventure",
   "Biography",
   "Autobiography",
   "Self-Help",
   "Business",
   "Travel",
   "Poetry",
   "Memoir",
   "Young Adult",
   "Children's",
   "Graphic Novel",
   "Cookbooks",
   "Art",
   "Philosophy",
   "Religion",
   "Science",
   "Psychology",
   "Sociology",
   "Education",
   "Politics",
   "Economics",
   "Health and Fitness"
]


const BOOKS_READ_STATUS = {
   read: "read",
   toRead: "to-read"
}


const MAIL_CONFIG = {
   email: process.env.GMAIL,
   password: process.env.GMAIL_APP_PASSWORD
}


const RATING_POINTS = {
   "1": 0,
   "2": 0,
   "3": 0,
   "4": 0,
   "5": 0,
   "6": 0,
   "7": 0,
   "8": 0,
   "9": 0,
   "10": 0
}


module.exports = { AUTH_SECRET, MONGO_URI, ROLES, BOOK_CATEGORIES, BOOKS_READ_STATUS, MAIL_CONFIG, RATING_POINTS, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME }