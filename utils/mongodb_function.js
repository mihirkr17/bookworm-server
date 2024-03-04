const mongodbDatabase = require("mongodb");


module.exports.compareObjectId = (id) => {
   return id ? mongodbDatabase.ObjectId.createFromHexString(id) : "";
}

module.exports.isValidObjectId = (id) => {
   return id ? mongodbDatabase.ObjectId.isValid(id) : false;
}