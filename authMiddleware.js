module.exports.isloggedIn = (req, res, next) => {
  // now that we are using passport,
  // if a user is logged in, isAuthenticated() return true and false if not logged in.
  if (!req.isAuthenticated()) {
    req.flash("error", "You need to login first!");
    return res.redirect("/login");
  }
  next();
};
