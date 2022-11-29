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

// middleware parsing body:
app.use(express.urlencoded({ extended: true }));

// routes:

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  res.send(req.body);
});

app.get("/secret", (req, res) => {
  res.send("This is a secret route!");
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
