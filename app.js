const express = require("express");
// cookie-parser was developed as another npm module,
// probably because some projects dont need to parse cookies.
const cookieParser = require("cookie-parser");

const app = express();

// using cookieParser as middleware to parse cookies:
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Welcome to homePage!");
});

// cookies are used to store some information on the browser.
// All information in cookies is also sent to server in each request.
// They add some statefulness between requests.

app.get("/setName", (req, res) => {
  res.cookie("Name", "Doctor_wario");
  res.send("Your name has been set in cookies!");
});

app.get("/greet", (req, res) => {
  // getting cookies:
  const { Name = "No-Name" } = req.cookies;

  console.log(`Welcome ${Name}`);
  res.send(`Welcome ${Name}`);

  // you can try it by changing the name in cookies in your browser's application tab and trying again!
});

app.listen(3000, () => {
  console.log("serving on port 3000");
});
