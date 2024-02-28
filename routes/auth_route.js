const express = require("express");
const router = express.Router();

const { loginSystem, userSignUpSystem, editorSignUpSystem, resetPassword, changePasswordSystem } = require("../controllers/auth_ctl");
const { verifyAuth } = require("../middlewares/auth_mdl");
const { editorAvatarUploader } = require("../middlewares/multer_mdl");


/**
 * [Login Route]
 *
 * @param   {[type]}  /login       [/login description]
 * @param   {[type]}  loginSystem  [loginSystem description]
 * @body {email, password}
 * @return  {[type]}               [return accessToken]
 */
router.post("/login", loginSystem);



/**
 * [User Registration Route]
 *
 * @param   {[type]}  /user/signup      [/user/signup description]
 * @param   {[type]}  userSignUpSystem  [userSignUpSystem description]
 * @body {firstName, lastName, email, password}
 * @return  {[type]}                    [return response message]
 */
router.post("/user/signup", userSignUpSystem);



/**
 * [Editor Registration Route]
 *
 * @param   {[type]}  /editor/signup      [/editor/signup description]
 * @param   {[type]}  editorSignUpSystem  [editorSignUpSystem description]
 * @body {firstName, lastName, email, password}
 * @return  {[type]}                      [return response message]
 */
router.post("/editor/signup", editorAvatarUploader().single("avatar"), editorSignUpSystem);


/**
 * [Reset Password Route]
 *
 * @param   {[type]}  /credential/reset-password  [/credential/reset-password description]
 * @param   {[type]}  resetPassword  [resetPassword description]
 * @body { email, newPassword }
 * @return  {[type]}                              [return message]
 */
router.put("/credential/reset-password", resetPassword);


/**
 * [Change Password Route]
 *
 * @param   {[type]}  /credential/change-password  [/credential/change-password description]
 * @param   {[type]}  verifyAuth                   [verifyAuth description]
 * @param   {[type]}  changePasswordSystem         [changePasswordSystem description]
 * @body { oldPassword, newPassword } 
 * @return  {[type]}                               [return message]
 */
router.post("/credential/change-password", verifyAuth, changePasswordSystem);

module.exports = router;