module.exports.isloggedIn = (req, res, next) => {
  // also notice that we are storing a signed in user in a session,
  // which can be accessed in req.user (which is setup by passport.js)
  // console.log("Current user: ", req.user);
  // This outputs:
  // {
  //   _id: new ObjectId("63b3e524e132042ab49d933f"),
  //   email: 'emailid@emailprovider.com',
  //   username: 'name_of_user',
  //   __v: 0
  // }

  // now that we are using passport,
  // if a user is logged in, isAuthenticated() return true and false if not logged in.
  if (!req.isAuthenticated()) {
    req.flash("error", "You need to login first!");
    return res.redirect("/login");
  }
  next();
};
