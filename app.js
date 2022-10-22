const express = require("express");
const morgan = require("morgan");

const app = express();

app.use(morgan("dev"));

// building a custom middleware chain:

app.use((req, res, next) => {
  console.log("From 1st custom middleware");
  // calls the next matching middleware or route handler,
  // this doesnt mean that lines after this wont execute!
  next();
  // This will execute but after all the other middlewares in the chain are executed!
  console.log("From 1st custom middleware - after calling next()");
});

app.use((req, res, next) => {
  console.log("From 2nd custom middleware");

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
  console.log("From 3rd custom middleware");
  next();
});

// GET requests

app.get("/", (req, res) => {
  res.send("Hello");
});

app.listen(3000, () => {
  console.log("serving on port 3000");
});
