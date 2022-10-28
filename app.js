const express = require("express");
const morgan = require("morgan");

const app = express();

app.use(morgan("common"));

// middlewares :

app.use((req, res, next) => {
  console.log("From 1st custom middleware");

  req.currentTime = Date.now();
  next();
  console.log("From 1st custom middleware - after calling next()");
});

app.use((req, res, next) => {
  console.log("From 2nd custom middleware");
  console.log("current time from 2nd middleware : ", req.currentTime);

  return next();
  console.log("This wont execute");
});

app.use((req, res, next) => {
  console.log("current time from 3rd middleware : ", req.currentTime);
  console.log("From 3rd custom middleware");
  next();
});

app.use("/dog", (req, res, next) => {
  console.log("I love dogs - 4th middleware");
  next();
});

const verifyPassword = (req, res, next) => {
  if (req.query.password === "secret123") {
    next();
  }

  // res.status(401).send("Sorry! you need to give correct password!");

  // Here we can throw a custom error in express:
  throw new Error("Password Required!!!!");
};

// GET requests

app.get("/error", (req, res) => {
  // This will throw an error since chicken does not exist:
  chicken.fly();
});

app.get("/", (req, res) => {
  console.log("current time from / : ", req.currentTime);
  res.send("Hello");
});

app.get("/dog", (req, res) => {
  console.log("current time from /dog : ", req.currentTime);
  res.send("Woof woof");
});

app.get("/secret", verifyPassword, (req, res) => {
  res.send("This is a secret message!");
});

// middleware for sending 404 if nothing was matched!
app.use((req, res) => {
  res.status(404).send("NOT FOUND! - 5th middleware");
});

// creating our own custom error handling middleware:

// if a middleware's callback contains 4 params, express will know it is a error handler.
app.use((err, req, res, next) => {
  // we can console log some string:
  console.log("*****************************");
  console.log("***********error*************");
  console.log("*****************************");

  // or we can console log the stack trace:
  console.log(err);

  // then pass the err object to next middleware to handle!
  // note that if you dont pass the error object to the next middleware,
  // it will not be able to handle that error!

  // by default,
  // if err obj is passed to next fn express prints the stack trace in dom if in dev environment.
  // if err obj is not passed express simply prints "cannot GET /route_name"
  next(err);
});

app.listen(3000, () => {
  console.log("serving on port 3000");
});
