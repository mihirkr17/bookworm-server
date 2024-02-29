const express = require("express");
const { verifyAuth, isEditor } = require("../middlewares/auth_mdl");
const { showAllUsersInEditorDashboard, updateAvatar, deleteUserById, persistUser, checkUserExistOrNotByEmail, myProfile, changeUserNames } = require("../controllers/users_ctl");
const { editorAvatarUploader } = require("../middlewares/multer_mdl");
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
 * @param   {[type]}  persistUser  [persistUser description]
 *
 * @return  {[type]}                   [return profile data]
 */
router.get("/persistence", verifyAuth, persistUser);


/**
 * [Check User Route]
 *
 * @param   {[type]}  /credential/check-account         [/credential/check-account description]
 * @param   {[type]}  checkUserExistOrNotByEmail  [checkUserExistOrNotByEmail description]
 * @body  { email }
 * @return  {[type]}                                    [return description]
 */
router.post("/credential/check-account", checkUserExistOrNotByEmail);



router.get("/my-profile", verifyAuth, myProfile);


router.put("/change-names", verifyAuth, changeUserNames);

router.put("/update-avatar", verifyAuth, editorAvatarUploader().single("avatar"), updateAvatar)

module.exports = router;