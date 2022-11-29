const express = require("express");
const app = express();

// setting up ejs and relative paths for views:
const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// creating/connecting to a database called authDemo:
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/authDemo", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Importing models:
const User = require("./models/users");

// Finally importing bcrypt for hashing and salting passwords:
const bcrypt = require("bcrypt");
// importing express-sessions for session management:
const session = require("express-session");

// middleware parsing body:
app.use(express.urlencoded({ extended: true }));
// middleware for express sessions:
app.use(session({ secret: "not_a_good_way_to_store_a_secret" }));

// This function works as a middleware,
// that verifies whether user is logged in or not:
const requireLogin = (req, res, next) => {
  // If session was not set (aka user was not logged in),
  // simply redirect to login page:
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  // otherwise continue to the route:
  next();
};

// routes:

app.get("/", (req, res) => {
  res.send("Welcome to home page!");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  // creating hash from plaintext and saltRounds:
  const hash = await bcrypt.hash(password, 12);

  // just of checking hash:
  // res.send(`username: ${username} password: ${hash}`);

  // findOne() returns null, if no matches are found in db.
  const userExists = await User.findOne({ username });

  // we will only allow unique usernames in our db!
  // also empty string passwords will not be allowed!

  // If a particular user does not exist already in db and password is not empty string,
  // then we create those creds:
  if (userExists === null && password != "") {
    // check whether data is according to schema:
    const newUser = new User({
      username,
      password: hash
    });

    // if yes, save data into the database:
    await newUser.save();

    // verify by going to mongosh and type the following commands:
    // show dbs
    // use authDemo
    // show collections
    // db.users.find()

    // once registeration is successful,
    // set the session token and redirect to "/secret":
    req.session.user_id = newUser._id;
    res.redirect("/secret");
  } else {
    // if registeration failed, redirect to home page:
    res.redirect("/");
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Never specify which of username or password is wrong!
  // you dont want hackers to know if a particular username is correct and only password is wrong.
  // we need to make it difficult for them to do a brute force attack.

  // note that we are only storing unique usernames in db during registerations.
  // No duplicate usernames are stored in db, hence findOne will always return the correct user.
  // if duplicates were allowed, it would've only returned the first match only, which might cause problems.

  // Also we are not storing empty string passwords in our db,
  // so if username was wrong, we can compare input password with "" so login will always fail.

  // search the username in our db:
  const user = await User.findOne({ username });

  // search the passwords in our db:
  const result = await bcrypt.compare(
    password,
    user && user.password ? user.password : ""
  );

  if (result) {
    // if login is successful, then set session id to user_id
    // and redirect to "/secret"
    req.session.user_id = user._id;
    res.redirect("/secret");
  } else {
    // if login fails, redirect to "/login"
    res.redirect("/login");
  }
});

// we will use "requireLogin" as middleware,
// which will verify whether user is logged in or not
// If a user is logged in we will continue to this route,
// if a user isn't logged in they will be redirected to login page.

// This route should only be accessible if user is logged in! (Work in progress!)
app.get("/secret", requireLogin, (req, res) => {
  // if session token is present, then show secret page:
  res.render("secret");
});

// similarly this middleware also works for other protected routes:
app.get("/topsecret", requireLogin, (req, res) => {
  res.send("This is a top secret!");
});

app.post("/logout", (req, res) => {
  // we can just set user_id to null or .....
  // req.session.user_id = null;

  // we can use req.session.destroy() to completely delete the session:
  req.session.destroy();

  res.redirect("/login");
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
