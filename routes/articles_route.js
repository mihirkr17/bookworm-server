const express = require("express");
const router = express.Router();
const { verifyAuth, isEditor } = require("../middlewares/auth_mdl");

// Articles Controllers
const { createArticle, deleteArticleById, showAllArticles, getArticleById, modifyArticle, homeArticle } = require("../controllers/articles_ctl");
const { articleThumbUploader } = require("../middlewares/file_uploader");

/**
 * [Create Article]
 *
 * @param   {[type]}  /create            [/create description]
 * @param   {[type]}  verifyAuth         [verifyAuth description]
 * @param   {[type]}  isEditor           [isEditor description]
 * @param   {[type]}  thumbnailUploader  [thumbnailUploader description]
 * @param   {[type]}  thumbnail          [thumbnail description]
 * @body {title, content, thumbnail}
 * @return  {[type]}                     [return description]
 */
router.post("/create", verifyAuth, isEditor, articleThumbUploader, createArticle);

/**
 * [Modify Article Route]
 *
 * @param   {[type]}  /modify/:articleId  [/modify/:articleId description]
 * @param   {[type]}  verifyAuth          [verifyAuth description]
 * @param   {[type]}  isEditor            [isEditor description]
 * @param   {[type]}  thumbnailUploader   [thumbnailUploader description]
 * @param   {[type]}  thumbnail           [thumbnail description]
 * @body {title, content, thumbnail}
 * @return  {[type]}                      [return response message]
 */
router.put("/modify/:articleId", verifyAuth, isEditor, articleThumbUploader, modifyArticle);


/**
 * [delete article route]
 *
 * @param   {[type]}  /delete/:articleId  [/delete/:articleId description]
 * @param   {[type]}  verifyAuth          [verifyAuth description]
 * @param   {[type]}  isEditor            [isEditor description]
 * @param   {[type]}  deleteArticleById   [deleteArticleById description]
 *
 * @return  {[type]}                      [return message]
 */
router.delete("/delete/:articleId", verifyAuth, isEditor, deleteArticleById);


/**
 * [Show all articles]
 *
 * @param   {[type]}  showAllArticles  [showAllArticles description]
 * @query {q, sort, page, limits} ?q= title &sort=oldest | dsc | asc &page=1 & limits= 10
 * @return  {[type]}                   [return articles as a array]
 */
router.get("/", showAllArticles);


/**
 * [Single article description route]
 *
 * @param   {[type]}  /single/:articleId  [/single/:articleId description]
 * @param   {[type]}  getArticleById      [getArticleById description]
 *
 * @return  {[type]}                      [return single article description]
 */
router.get("/single/:articleId", getArticleById);


router.get("/home", homeArticle)

module.exports = router;