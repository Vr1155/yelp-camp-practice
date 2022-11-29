const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username cannot be blank"]
  },
  password: {
    type: String,
    required: [true, "Password cannot be blank"]
  }
});

// Notice that, whenever you use statics, you are storing those methods/variables
// in class not in object/instance.
// Here, "findAndValidate" is stored in userSchema class and not in "User" instance.

userSchema.statics.findAndValidate = async function (username, password) {
  // search the username in our db:
  const user = await this.findOne({ username });
  // here, "this" implies "User".
  // for some reason, this keyword does not work in arrow function,
  // so i created function using "function" keyword and it works now.
  // for more details on why "this" does not work in arrow function,
  // see: https://stackoverflow.com/questions/34538331/why-is-this-not-working-in-an-es6-arrow-function

  // search the passwords in our db:
  const result = await bcrypt.compare(
    password,
    user && user.password ? user.password : ""
  );

  // if result is true (ie. creds are correct) then return user (as we will need it further)
  // else return false:
  return result ? user : false;
};

// This "pre" middleware, runs before everytime save() function is executed.
// Over here, this pre middleware, helps us hash passwords before saving them in our db:
userSchema.pre("save", async function (next) {
  // If the password on current "User" instance is not modified (i.e. hash was not changed),
  // then simply go ahead and run save().
  // kinda unnecessary for our case, but basically,
  // isModified() returns true if the password of current User instance is already created/set
  if (!this.isModified("password")) return next();

  // Else we need to hash the new password.

  // creating hash from plaintext and saltRounds.
  // here, this.password, refers to the password that was present in the current "User" instance being saved.
  this.password = await bcrypt.hash(this.password, 12);
  // now that password has been converted to hash of password, we will continue to save():
  next();
});

module.exports = mongoose.model("User", userSchema);
