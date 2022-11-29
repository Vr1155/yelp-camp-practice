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

  res.redirect("/");
});

app.get("/secret", (req, res) => {
  res.send("This is a secret route!");
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
