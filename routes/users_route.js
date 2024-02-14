const express = require("express");
const { verifyAuth, isEditor } = require("../middlewares/auth_mdl");
const { showAllUsersInEditorDashboard, deleteUserById, viewUserProfile, checkUserExistOrNotByEmail } = require("../controllers/users_ctl");
const router = express.Router();


/**
 * [Get all users route]
 * Only for editor
 * @param   {[type]}  /get-users                     [/get-users description]
 * @param   {[type]}  verifyAuth                     [verifyAuth description]
 * @param   {[type]}  isEditor                       [isEditor description]
 * @param   {[type]}  showAllUsersInEditorDashboard  [showAllUsersInEditorDashboard description]
 *
 * @return  {[type]}                                 [return description]
 */
router.get("/get-users", verifyAuth, isEditor, showAllUsersInEditorDashboard);


/**
 * [delete user route]
 * only for editor
 * @param   {[type]}  /delete-user/:userId  [/delete-user/:userId description]
 * @param   {[type]}  verifyAuth            [verifyAuth description]
 * @param   {[type]}  isEditor              [isEditor description]
 * @param   {[type]}  deleteUserById        [deleteUserById description]
 *
 * @return  {[type]}                        [return description]
 */
router.delete("/delete-user/:userId", verifyAuth, isEditor, deleteUserById);


/**
 * [View User Profile]
 *
 * @param   {[type]}  /profile         [/profile description]
 * @param   {[type]}  verifyAuth       [verifyAuth description]
 * @param   {[type]}  viewUserProfile  [viewUserProfile description]
 *
 * @return  {[type]}                   [return profile data]
 */
router.get("/profile", verifyAuth, viewUserProfile);


/**
 * [Check User Route]
 *
 * @param   {[type]}  /credential/check-account         [/credential/check-account description]
 * @param   {[type]}  checkUserExistOrNotByEmail  [checkUserExistOrNotByEmail description]
 * @body  { email }
 * @return  {[type]}                                    [return description]
 */
router.post("/credential/check-account", checkUserExistOrNotByEmail);

module.exports = router;