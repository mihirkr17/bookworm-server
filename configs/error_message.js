const ERROR_MESSAGE = {
   pwdErr: `Password must be at least 5 characters long and include at least one digit, one lowercase letter, and one special character.`,
   pwdNotMatchErr: `Password didn't matched!`,
   oldPwdNotMatchErr: `Old password not matched!`,
   firstNameErr: `First name must be greater than 2 and less than 10 characters!`,
   lastNameErr: `Last name must be greater than 2 and less than 8 characters!`,
   emailErr: `Invalid email address!`,
   emailExistErr: `Email already exists. Try with another email address.`,
   bookIdErr: `Invalid book id!`,
   notFoundAccWithEmail: function (email) {
      return `User with ${email} not found!`;
   }
}

module.exports = { ERROR_MESSAGE };