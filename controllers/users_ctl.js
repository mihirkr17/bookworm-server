const { ObjectId } = require("mongodb");
const { ROLES } = require("../configs/constant");
const USERS_TBL = require("../models/USERS_TBL");
const { Success, Error400, Error503, Error404 } = require("../responser/response");
const validator = require("validator");
const { ERROR_MESSAGE } = require("../configs/error_message");
const { smtpSender } = require("../services/email_srv");

/**
 * [All USERS_TBL in Editor Dashboard]
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function showAllUsersInEditorDashboard(req, res, next) {
   try {

      let page = req?.query?.page || 1;
      let limit = req?.query?.limit || 10;

      let skip = Math.ceil((parseInt(page) - 1) * parseInt(limit));

      const users = await USERS_TBL.find({ role: ROLES.user }, { password: 0 }).skip(skip).limit(parseInt(limit));

      const totalUsersCount = await USERS_TBL.countDocuments({});
      return new Success(res, {
         message: "",
         data: {
            users: users || [],
            totalUsersCount: totalUsersCount || 0
         }
      })
   } catch (err) {
      next(err);
   }
}



/**
 * [Delete User By User ID]
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function deleteUserById(req, res, next) {
   try {
      const { userId } = req?.params;

      if (!userId || !ObjectId.isValid(userId)) throw new Error400('Invalid user id in the params!');

      await USERS_TBL.deleteOne({ $and: [{ _id: new ObjectId(userId) }, { role: ROLES.user }] });

      return new Success(res, {
         message: `User with id ${userId} deleted successfully.`
      })
   } catch (error) {
      next(error);
   }
}



/**
 * [Viewing User Profile Data In profile page]
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function viewUserProfile(req, res, next) {
   try {
      const { _id } = req?.decoded;

      const user = await USERS_TBL.findOne({ _id: new ObjectId(_id) }, { password: 0 });

      if (!user) throw new Error("Invalid Credentials!");

      return new Success(res, {
         data: {
            profile: user || {}
         }
      })
   } catch (error) {
      next(error);
   }
}




/**
 * [Check If User account exist or not by email address]
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function checkUserExistOrNotByEmail(req, res, next) {
   try {
      const { email } = req?.body;
      if (!email || !validator.isEmail(email)) throw new Error400(ERROR_MESSAGE.emailErr);

      const user = await USERS_TBL.findOne({ email });

      if (!user?.email) throw new Error404(ERROR_MESSAGE.notFoundAccWithEmail(email));

      // await smtpSender({
      //    to: email,
      //    subject: "Password Reset Request",
      //    html: `<p></p>`
      // });

      return new Success(res, {
         message: `User found with this ${email}.`
      })
   } catch (error) {
      next(error);
   }
}






module.exports = {
   showAllUsersInEditorDashboard,
   deleteUserById,
   viewUserProfile,
   checkUserExistOrNotByEmail
}