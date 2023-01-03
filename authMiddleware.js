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
    // also note that incase user was trying to do something before logging in,
    // we want to redirect them to that url once they've logged in,
    // For that we will use req.session to store the original url which was in req.originalUrl

    // for eg. if user clicks on new campground button without logging:
    // console.log("origin paths: ", req.path, req.originalUrl);
    // This will return: "/new /campgrounds/new"
    // we will use req.originalUrl here and store it in req.session.returnTo.

    req.session.returnTo = req.originalUrl;

    req.flash("error", "You need to login first!");
    return res.redirect("/login");
  }
  next();
};
