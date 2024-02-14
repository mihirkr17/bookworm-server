const jwt = require("jsonwebtoken");
const { AUTH_SECRET } = require("../configs/constant");


/**
 * 
 * @param {*} data 
 * @returns 
 */
function generateAuthToken(data) {
   return new Promise((resolve, reject) => {
      if (!data) {
         reject(new Error("Data not found in the payload!"));
      }
      

      if (!AUTH_SECRET || typeof AUTH_SECRET === "undefined") reject(new Error("Please set jwt secret in the env!"));

      const token = jwt.sign(data, AUTH_SECRET, {
         algorithm: "HS256",
         expiresIn: "16h",
      });

      if (!token) {
         reject(new Error("Sorry, unable to generate the authentication token at the moment. Please try again later!"));
      }

      resolve(token);
   });
}

module.exports = { generateAuthToken };