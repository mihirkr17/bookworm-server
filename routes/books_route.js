const express = require("express");
const router = express.Router();

// Book Controllers
const {
   addBookByCSV,
   createBook,
   deleteSingleBookById,
   modifyBook,
   addBookToTheReadCategory,
   addRatingsForBook,
   getAllBooksBySearchOrNotSearchSystem,
   getSingleBookDataById,
   addCommentsForBook,
   deleteBooksCommentByIdInDashboard,
   showAllBooksCommentsInDashboard,
   reportBooksComment,
   showAllReadCategoryBooks,
   myBookSelfBooks,
   getAllBooksCategories,
   deleteOwnComments,
   deleteReadCategoryBookById } = require("../controllers/books_ctl");
const { verifyAuth, isEditor } = require("../middlewares/auth_mdl");
const { uploadBookAsCsv, thumbnailUploader } = require("../middlewares/multer_mdl");


/**
 * [Upload book Data by csv]
 *
 * @param   {[type]}  /add-book        [/add-book description]
 * @param   {[type]}  verifyAuth       [verifyAuth description]
 * @param   {[type]}  isEditor         [isEditor description]
 * @param   {[type]}  uploadBookAsCsv  [uploadBookAsCsv description]
 * @param   {[type]}  book             [book description]
 *
 * @return  {[type]}                   [return response message]
 */
router.post("/add-book-by-csv", verifyAuth, isEditor, uploadBookAsCsv().single("book"), addBookByCSV);



/**
 * [Create Book]
 * editor and user can add book
 * @param   {[type]}  /create-book       [/create-book description]
 * @param   {[type]}  verifyAuth         [verifyAuth description]
 * @param   {[type]}  thumbnailUploader  [thumbnailUploader description]
 * @param   {[type]}  thumbnail          [thumbnail book image fieldName must be thumbnail]
 * @body { title, isbn, authors, categories, publishedYear, numberPages, description }
 * @return  {[type]}                     [return response message]
 */
router.post("/create-book", verifyAuth, thumbnailUploader().single("thumbnail"), createBook);



/**
 * [Modify Book data]
 *
 * @param   {[type]}  /modify/:bookId    [/modify/:bookId description]
 * @param   {[type]}  verifyAuth         [verifyAuth description]
 * @param   {[type]}  thumbnailUploader  [thumbnailUploader description]
 * @param   {[type]}  thumbnail          [thumbnail book image fieldName must be thumbnail]
 *
 * @return  {[type]}                     [return response message]
 */
router.put("/modify/:bookId", verifyAuth, thumbnailUploader().single("thumbnail"), modifyBook);



/**
 * [delete book by book id]
 *
 * @param   {[type]}  /delete/:bookId         [/delete/:bookId description]
 * @param   {[type]}  verifyAuth              [verifyAuth description]
 * @param   {[type]}  isEditor                [isEditor description]
 * @param   {[type]}  deleteSingleBookById  [deleteSingleBookById description]
 *
 * @return  {[type]}                          [return response message]
 */
router.delete("/delete/:bookId", verifyAuth, isEditor, deleteSingleBookById);


/**
 * [post add bookStatus to-read or read  ]
 *
 * @param   {[type]}  /action/:bookId        [/action/:bookId description]
 * @param   {[type]}  verifyAuth             [verifyAuth description]
 * @param   {[type]}  addBookToTheReadCategory  [addBookToTheReadCategory description]
 * @query    {status} /action/:bookId?status=to-read | read
 * @return  {[type]}                         [return response message]
 */
router.put("/action/:bookId", verifyAuth, addBookToTheReadCategory);


/**
 * [Show all read category books route by individual users]
 *
 * @param   {[type]}  /show-read-category           [/show-read-category description]
 * @param   {[type]}  verifyAuth                    [verifyAuth description]
 * @param   {[type]}  showAllReadCategoryBooks  [showAllReadCategoryBooks description]
 *
 * @return  {[type]}                                [return read category books array]
 */
router.get("/show-read-category", verifyAuth, showAllReadCategoryBooks);



/**
 * [delete read categories book by book id]
 *
 * @param   {[type]}  /delete-read-category/book/:bookId  [/delete-read-category/book/:bookId description]
 * @param   {[type]}  verifyAuth                          [verifyAuth description]
 * @param   {[type]}  deleteReadCategoryBookById          [deleteReadCategoryBookById description]
 *
 * @return  {[type]}                                      [return description]
 */
router.delete("/delete-read-category/book/:bookId", verifyAuth, deleteReadCategoryBookById);


/**
 * [Rate Books]
 *
 * @param   {[type]}  /rate/:bookId   [/rate/:bookId description]
 * @param   {[type]}  verifyAuth      [verifyAuth description]
 * @param   {[type]}  addRatingsForBook  [addRatingsForBook description]
 * @body    {rating} [number]
 * @return  {[type]}                  [return success or error message]
 */
router.post("/rate/:bookId", verifyAuth, addRatingsForBook);



/**
 * [Add Comments For Books]
 *
 * @param   {[type]}  /add-comment/:bookId  [/add-comment/:bookId description]
 * @param   {[type]}  verifyAuth            [verifyAuth description]
 * @param   {[type]}  addCommentsForBook    [addCommentsForBook description]
 * @body {content} [string, string]
* @return  {[type]}                  [return success or error message]
 */
router.post("/add-comment/:bookId", verifyAuth, addCommentsForBook);


/**
 * [Report The Comment Route]
 *
 * @param   {[type]}  /comment/report/:commentId  [/comment/report/:commentId description]
 * @param   {[type]}  verifyAuth                  [verifyAuth description]
 * @param   {[type]}  reportBooksComment          [reportBooksComment description]
 *
 * @return  {[type]}                              [return description]
 */
router.post("/comment/report/:commentId", verifyAuth, reportBooksComment);


/**
 * [get books]
 * @param {[type]}   /
 * @param   {[type]}  getAllBooksBySearchOrNotSearchSystem  [getAllBooksBySearchOrNotSearchSystem description]
 * @query {[type]} {q, sort, year, ctg} /?q=author | title&sort=asc | dsc | highest_rated | lowest_rated&year=2007&ctg=Fiction,Phycology
 * @return  {[type]} [return {totalSearchResultCount: number, searchedBooks: []}]
 */
router.get("/", getAllBooksBySearchOrNotSearchSystem);


/**
 * [Single Book Data by book id]
 *
 * @param   {[type]}  /single/:bookId        [/single/:bookId description]
 * @param   {[type]}  getSingleBookDataById  [getSingleBookDataById description]
 *
 * @return  {[type]}                         [return book data as a object]
 */
router.get("/single/:bookId", getSingleBookDataById);


/**
 * [delete comment route]
 * Only for editor dashboard
 * @param   {[type]}  /comment/delete-comment/:commentId  [/comment/delete-comment/:commentId description]
 * @param   {[type]}  verifyAuth                          [verifyAuth description]
 * @param   {[type]}  isEditor                            [isEditor description]
 * @param   {[type]}  deleteBooksCommentByIdInDashboard        [deleteBooksCommentByIdInDashboard description]
 *
 * @return  {[type]}                                      [return success message]
 */
router.delete("/comment/delete-comment/:commentId", verifyAuth, isEditor, deleteBooksCommentByIdInDashboard);



/**
 * [Show All Comments in Editor Dashboard Route]
 *
 * @param   {[type]}  /show-all-comments          [/show-all-comments description]
 * @param   {[type]}  verifyAuth                  [verifyAuth description]
 * @param   {[type]}  isEditor                    [isEditor description]
 * @param   {[type]}  showAllBooksCommentsInDashboard  [showAllBooksCommentsInDashboard description]
 *
 * @return  {[type]}                              [return comments and totalCommentCount]
 */
router.get("/show-all-comments", verifyAuth, isEditor, showAllBooksCommentsInDashboard);


/**
 * [My Books Route]
 *
 * @param   {[type]}  /my-books                             [/my-books description]
 * @param   {[type]}  verifyAuth                            [verifyAuth description]
 * @param   {[type]}  getAllBooksBySearchOrNotSearchSystem  [getAllBooksBySearchOrNotSearchSystem description]
 *
 * @return  {[type]}                                        [return description]
 */
router.get("/my-books", verifyAuth, getAllBooksBySearchOrNotSearchSystem);


router.get("/manage", verifyAuth, getAllBooksBySearchOrNotSearchSystem);


router.get("/mybookself", verifyAuth, myBookSelfBooks);


router.get("/categories-all", getAllBooksCategories);


router.delete("/delete-own-comment/:commentId/:bookId", verifyAuth, deleteOwnComments)

module.exports = router;