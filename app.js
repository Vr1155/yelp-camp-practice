const express = require("express");
const morgan = require("morgan");

const app = express();

app.use(morgan("common"));

// building a custom middleware chain:

app.use((req, res, next) => {
  console.log("From 1st custom middleware");

  // We can override the request method like this.
  // (can also be conditionally like if a query param is present that helps identify which method to override!)

  // req.method = "GET";

  // In this way middlewares can modify the request object!

  // For now lets set a current time in request object:
  req.currentTime = Date.now();
  // we can access this in subsequent middlewares or route handlers!

  // calls the next matching middleware or route handler,
  // this doesnt mean that lines after this wont execute!
  next();
  // This will execute but after all the other middlewares in the chain are executed!
  console.log("From 1st custom middleware - after calling next()");
});

app.use((req, res, next) => {
  console.log("From 2nd custom middleware");
  console.log("current time from 2nd middleware : ", req.currentTime);

  // we can also short circuit this chain by sending a response form this middleware:
  // res.send("Hello from 2nd middleware!");
  // If you uncomment this request-response cycle gets completed here itself,
  // the next matching middleware/route handler wont be called after this!

  // this executes the next matching middleware and returns,
  // all lines after this wont execute.
  return next();
  console.log("This wont execute");
});

app.use((req, res, next) => {
  console.log("current time from 3rd middleware : ", req.currentTime);
  console.log("From 3rd custom middleware");
  next();
});

// we can also specify middlewares which run only on specified path.
// note that this middleware will run on any method type (get,post,put... etc.) as long as path is "/dog".
// we can also use regex here instead of just a string, refer docs for app.use()

app.use("/dog", (req, res, next) => {
  console.log("I love dogs - 4th middleware");
  next();
});

// You can also create functions to be used as middlewares to protect routes using some conditional logic,
// like a particular query string should be present in the request.
// Note that this is NOT proper authentication!
const verifyPassword = (req, res, next) => {
  if (req.query.password === "secret123") {
    next();
  } else {
    res.status(401).send("Sorry! you need to give correct password!");
  }
};

// GET requests

app.get("/", (req, res) => {
  console.log("current time from / : ", req.currentTime);
  res.send("Hello");
});

app.get("/dog", (req, res) => {
  console.log("current time from /dog : ", req.currentTime);
  res.send("Woof woof");
});

// notice that verifyPassword() is now the middleware, which executes before this app.get()
// This is one way to do conditional access control to certain routes, but this is not proper authentication.
app.get("/secret", verifyPassword, (req, res) => {
  res.send("This is a secret message!");
});

// we can also use middlewares for sending 404 if nothing was matched!
app.use((req, res) => {
  res.status(404).send("NOT FOUND! - 5th middleware");
});

app.listen(3000, () => {
  console.log("serving on port 3000");
});
