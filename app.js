const express = require("express");
const app = express();

// Session storage is information related a user's session and it is stored on server-side.
// for eg: items left in shopping cart on e-commerce site.

// Cookies on the other hand are stored on client-side (user's browser or mobile app).

// importing the express-session module from npm modules:
const session = require("express-session");

const sessionOptions = {
  secret: "This_is_a_poorly_stored_secret",
  resave: false,
  saveUninitialized: false
};

// resave and saveUninitialized are set to true as default but that default might get deprecated in future.
// please refer to docs for more details:
// https://www.npmjs.com/package/express-session

// using session middleware and specifying a secret key.
app.use(session(sessionOptions));
// With the inclusion of this middleware,
// Whenever a user sends a request to this server for the first time,
// A special session ID is sent in response and stored as a cookie in users browser,
// in browser session ID will have key: "connect.sid",
// And value will be something like: "s%3A_6V1xlSB9l9LYFmdBsip6YuLLu-hlu31.iPkDd0x5uRFL5oLjW1tcNHRDUEoufu7YwscfK3p%2FAh0"
// sid basically means session ID.

// And server also creates a session store for that user with that specific session ID,
// In "MemoryStore" session storage which is an in-memory session storage!

// Notice that whenever server restarts, and client sends requests after that,
// client will be given a new session id and previous session storage will be wiped out

// Note that using server's in-memory storage is not suitable for production ready apps,
// we might have to use something like redis for session storage.
// Please read the documentation for more details.

// In this way, express-session implements session storage in our app.

app.get("/viewcount", (req, res) => {
  // once a first request is received, a session store has been created on server-side
  // and session_id will be sent to client in response to be stored as a cookie in browser.

  // create a count variable in session store, if already present then add 1 to it.
  if (req.session.count) {
    req.session.count += 1;
  } else {
    req.session.count = 1;
  }

  res.send(`You viewed this page ${req.session.count} times`);
});

// we can store other data in session store as well:
app.get("/register", (req, res) => {
  const { username = "Anonymous" } = req.query;
  req.session.username = username;

  res.redirect("/greet");
});

app.get("/greet", (req, res) => {
  // everytime you hit this endpoint, username stored in session storage will be sent:

  // Notice how i am using null coalescing operator,
  // if username is null or undefinded, "Anonymous" is returned.
  res.send(`Hello and welcome back, ${req.session.username ?? "Anonymous"}`);
});

// It is also recomended to look into express-flash
// It simply uses session storage to store message which can be displayed to users,
// only for 1 time (like successfully added an item in db),
// without redirecting to some other page.
// You can add styling like bootstrap alert in your ejs template to show that flash message in.

// once a flash message is set, we can either pass it into an ejs
// or
// we use res.locals which helps us include flash messages in every response,
// so it can be directly accessed in every single ejs template and view without passing it.
// https://expressjs.com/en/5x/api.html#res.locals

app.listen(3000, () => {
  console.log("serving on port 3000");
});
