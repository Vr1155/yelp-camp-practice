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

// middleware parsing body:
app.use(express.urlencoded({ extended: true }));

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
  }

  // finally redirect to home page:
  res.redirect("/");
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
    res.send("Yay! your creds are correct!");
  } else {
    res.send("username or password are wrong!");
  }
});

// This route should only be accessible if user is logged in! (Work in progress!)
app.get("/secret", (req, res) => {
  res.send("This is a secret route!");
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
