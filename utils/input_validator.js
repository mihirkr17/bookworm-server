const { ObjectId: mdbObjectId } = require("mongodb");



function validPassword(password) {
   return (/^(?=.*\d)(?=.*[a-z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{5,}$/).test(password);
}

function validStringRegex(str) {
   return (/^[a-zA-Z0-9 ]+$/).test(str);
}


function validObjectId(id) {
   return mdbObjectId.isValid(id);
}

module.exports = { validPassword, validStringRegex, validObjectId }