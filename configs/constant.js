const AUTH_SECRET = process.env.AUTH_SECRET_CODE;
const MONGO_URI = process.env.MONGO_URI;

const ROLES = {
   user: "User",
   editor: "Editor"
}


const BOOK_CATEGORIES = [
   "Fiction",
   "Juvenile Fiction",
   "Biography & Autobiography",
   "History",
   "Drama",
   "Religion",
   "Sports & Recreation",
   "Travel",
   "Science",
   "Philosophy",
   "Psychology"
]


const BOOKS_READ_STATUS = {
   read: "read",
   toRead: "to-read"
}


const MAIL_CONFIG = {
   email: process.env.GMAIL,
   password: process.env.GMAIL_APP_PASSWORD
}


module.exports = { AUTH_SECRET, MONGO_URI, ROLES, BOOK_CATEGORIES, BOOKS_READ_STATUS, MAIL_CONFIG }