const { Success, Error400, Error404 } = require("../responser/response");
const USERS_TBL = require("../models/USERS_TBL");
const { generateAuthToken } = require("../services/auth_srv");
const { ROLES } = require("../configs/constant");
const validator = require('validator');
const { validPassword, validStringRegex } = require("../utils/input_validator");
const { ERROR_MESSAGE } = require("../configs/error_message");
const { smtpSender } = require("../services/email_srv")

// utils

async function registerCallback(data, role) {
   try {
      const { email, password, avatarFileName } = data;

      let avatar = avatarFileName && "/avatar/" + avatarFileName;

      const firstName = data?.firstName && data?.firstName.trim();
      const lastName = data?.lastName && data?.lastName.trim();

      if (!firstName || firstName.length < 3 || firstName.length > 18 || !validStringRegex(firstName))
         throw new Error400(ERROR_MESSAGE.firstNameErr);

      if (!lastName || lastName.length < 3 || lastName.length > 10 || !validStringRegex(lastName))
         throw new Error400(ERROR_MESSAGE.lastNameErr);

      if (!email || !validator.isEmail(email))
         throw new Error400(ERROR_MESSAGE.emailErr);

      if (!password || !validPassword(password))
         throw new Error400(ERROR_MESSAGE.pwdErr);

      const user = await USERS_TBL.findOne({ email });

      if (user?.email) throw new Error400(ERROR_MESSAGE.emailExistErr);

      await new USERS_TBL({
         firstName: validator.escape(firstName).trim(),
         lastName: validator.escape(lastName).trim(),
         email,
         password,
         avatar,
         role
      }).save();
   } catch (error) {
      throw new Error(error?.message);
   }
}

/**
 * [User Login]
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function loginSystem(req, res, next) {
   try {

      const { email, password } = req?.body;

      if (!email || !password) throw new Error400(`Required email address & password!`);

      if (!validator.isEmail(email)) throw new Error400(ERROR_MESSAGE.emailErr);

      // Finding user by email address
      const user = await USERS_TBL.findOne({ email });

      if (!user?._id) throw new Error400(ERROR_MESSAGE.notFoundAccWithEmail(email));

      // Compare input password with account password
      const isPasswordMatched = await user.comparePassword(password);

      if (!isPasswordMatched) throw new Error400(ERROR_MESSAGE.pwdNotMatchErr);

      // Generating access token
      const accessToken = await generateAuthToken({
         email: user?.email,
         _id: user?._id,
         role: user?.role,
         fullName: user?.firstName + " " + user?.lastName
      });

      return new Success(res, {
         message: `Login success.`,
         data: {
            accessToken
         }
      });
   } catch (error) {
      next(error)
   }
}


/**
 * [User Registration]
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function userSignUpSystem(req, res, next) {
   try {
      await registerCallback(req?.body, ROLES.user);

      return new Success(res, {
         message: "Thank you for registration"
      })

   } catch (error) {
      next(error);
   }
}


/**
 * [Editor Registration]
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function editorSignUpSystem(req, res, next) {
   try {

      const avatarFile = req?.file;

      if (!avatarFile?.filename) throw new Error400("Please select avatar!");

      let body = req?.body;

      if (!avatarFile?.path) throw new Error400("An unexpected error occurred when file uploading!");

      body["avatarFileName"] = avatarFile?.path;

      await registerCallback(body, ROLES.editor);

      return new Success(res, {
         message: "Thank you for registration"
      })

   } catch (error) {
      next(error);
   }
}




/**
 * [Change Password System]
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function changePasswordSystem(req, res, next) {
   try {
      const { email } = req?.decoded;

      const { oldPassword, newPassword } = req?.body;

      if (!oldPassword || !newPassword) throw new Error400('Required old & new password!');

      if (!validPassword(newPassword))
         throw new Error400(ERROR_MESSAGE.pwdErr);

      const user = await USERS_TBL.findOne({ email });

      if (!user?.email) throw new Error404(ERROR_MESSAGE.notFoundAccWithEmail(email));

      const isPwdMatched = await user.comparePassword(oldPassword);

      if (!isPwdMatched) throw new Error400(ERROR_MESSAGE.oldPwdNotMatchErr);

      // Attach new password here
      user.password = newPassword;

      await user.save();

      return new Success(res, {
         message: "Password updated successfully."
      });
   } catch (error) {
      next(error);
   }
}

/**
 * [Reset Password Request]
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @body email, newPassword
 */
async function resetPassword(req, res, next) {
   try {
      const { email, newPassword } = req?.body;



      if (!email || !validator.isEmail(email)) throw new Error400(ERROR_MESSAGE.emailErr);

      if (!newPassword || !validPassword(newPassword))
         throw new Error400(ERROR_MESSAGE.pwdErr);

      const user = await USERS_TBL.findOne({ email });

      if (!user?.email) throw new Error404(`User with ${email} not found!`);

      user.password = newPassword;

      await user.save();

      // await smtpSender({ to: email, subject: "Password Reset Request", html: "<p>Your password reset successfully</p>" });

      return new Success(res, {
         message: "Password reset successfully."
      })
   } catch (error) {
      next(error);
   }
}



module.exports = {
   loginSystem,
   userSignUpSystem,
   editorSignUpSystem,
   changePasswordSystem,
   resetPassword
};