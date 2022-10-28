const express = require("express");
const morgan = require("morgan");
// importing custom error class:
const appError = require("./appError");

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
  // throw new Error("Password Required!!!!");

  // Throwing our custom error class in express:
  throw new appError("Error message from app Error", 500);
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

app.get("/admin", (req, res) => {
  throw new appError("You are not a admin", 403);
});

// a route for async fn error handling

app.get("/async", async (req, res, next) => {
  // creating some dummy async function:

  // creating async functions is easier if you use promises like this:
  const resolveAfter2Seconds = flag => {
    if (flag)
      return new Promise(resolve => {
        setTimeout(() => {
          resolve("resolved");
        }, 2000);
      });

    return new Promise(reject => {
      setTimeout(() => {
        reject();
      }, 2000);
    });
  };

  // if flag was true, it will return "resolved", else it will return undefined.
  const response = await resolveAfter2Seconds(true);

  // lets do error handling for when it returns undefined.
  if (!response) {
    // note that you dont have to throw an error here, just create an error and pass it to next middleware in the chain.
    // Also since we dont want to continue executing code further ahead in this middleware, we will return from this next function.
    // It is important to use return here in this case, in case the next middleware is not sending a response,
    // but here the error handling middleware is sending the error message and status code as response,
    // no problem either way as only one response is needed to be sent.
    return next(new appError("Undefined was obtained, flag was false", 404));
  }

  console.log("response:", response);

  // if the response by async function is undefined, then throw our custom error:
  // if (!response) {
  //   throw new appError("This is an async error", 500);
  // }

  res.send(`Successful! This is the response: ${response}`);
});

// middleware for sending 404 if nothing was matched!
app.use((req, res) => {
  res.status(404).send("NOT FOUND! - 5th middleware");
});

// creating our own custom error handling middleware:

// if a middleware's callback contains 4 params, express will know it is a error handler.
// app.use((err, req, res, next) => {
//   // we can console log some string:
//   console.log("*****************************");
//   console.log("***********error*************");
//   console.log("*****************************");

//   // or we can console log the stack trace:
//   console.log(err);

//   // then pass the err object to next middleware to handle!
//   // note that if you dont pass the error object to the next middleware,
//   // it will not be able to handle that error!

//   // by default,
//   // if err obj is passed to next fn express prints the default stack trace in dom if in dev environment.
//   // if err obj is not passed express simply prints "cannot GET /route_name"
//   next(err);
// });

// Another error handling middleware to throw our custom appError class!
app.use((err, req, res, next) => {
  // you can run this middleware with /error endpoint

  // The error object has the following properties:
  // message, status, stack.
  // We can destructure these properties and modify them here

  const {
    message = "Hello from custom error class error middleware!",
    status = 500,
    stack
  } = err; // incase status was undefined, assign 500 to it.

  // you can console log the stack trace:
  console.log(
    "This is the stack trace from custom error handling middleware:",
    stack
  );

  // here message was already defined so the original value will be sent.
  res.status(status).send(message);
});

app.listen(3000, () => {
  console.log("serving on port 3000");
});
