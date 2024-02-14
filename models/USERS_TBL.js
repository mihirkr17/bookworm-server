const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");


const userSchema = new Schema({
   firstName: { type: String, required: [true, "First name required!"] },
   lastName: { type: String, required: [true, "Last name required!"] },
   email: {
      type: String,
      required: [true, "Email address required !!!"],
      unique: true,
      validate: [validator.isEmail, "Provide a valid email address !!!"],
   },
   password: { type: String, required: [true, "Required password!"] },
   login: { type: String },
   role: { type: String, enum: ["User", "Editor"] },
   createdAt: { type: Date, default: Date.now() }
})

userSchema.pre("save", async function (next) {
   try {
      if (this.isModified("password")) {
         this.password = await bcrypt.hash(this.password, 10);
         this.hasPassword = true;
      }

      next();
   } catch (error) {
      next(error);
   }
});

// compare client password
userSchema.methods.comparePassword = async function (
   clientPassword
) {
   try {
      return await bcrypt.compare(clientPassword, this.password);
   } catch (error) {
      throw new Error(error?.message);
   }
};


module.exports = model("USERS_TBL", userSchema, "USERS_TBL");