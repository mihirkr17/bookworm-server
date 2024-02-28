const jwt = require("jsonwebtoken");
const { AUTH_SECRET, ROLES } = require("../configs/constant");
const { Error403, Error401 } = require("../responser/response");

// Verify access token is it valid or not
async function verifyAuth(req, res, next) {
   try {
      const token = req.headers?.authorization?.split(" ")[1] || undefined;

      if (!token) throw new Error403("Forbidden! Required access token in the request header.");



      jwt.verify(token, AUTH_SECRET, (err, decoded) => {
         if (err) {
            throw new Error401("Unauthorized!");
         }

         req.decoded = decoded;

         next();
      });

   } catch (error) {
      next(error);
   }

}


// middleware for editor
async function isEditor(req, res, next) {
   try {
      const { role } = req?.decoded;

      if (role === ROLES?.editor) {
         next();
      } else {
         next(new Error403('This route only for editor'))
      }

   } catch (error) {
      next(error)
   }
}

async function getAuth(req, res, next) {

   const token = req.headers?.authorization?.split(" ")[1] || undefined;

   if (!token) {
      return next();
   }

   jwt.verify(token, AUTH_SECRET, (err, decoded) => {
      if (err) {
         req.decoded = undefined;
      } else {
         req.decoded = decoded;
      }

      return next();
   });
}


module.exports = { verifyAuth, isEditor, getAuth }