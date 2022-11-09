const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");

// importing our models:
const Product = require("./models/product");
const Farm = require("./models/farm");

const categories = ["fruit", "vegetable", "dairy"];

// connecting to mongo db:
mongoose
  .connect("mongodb://localhost:27017/farmStandTake2", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("MONGO CONNECTION OPEN!!!");
  })
  .catch(err => {
    console.log("OH NO MONGO CONNECTION ERROR!!!!");
    console.log(err);
  });

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// FARM ROUTES

// route to get all farms:
app.get("/farms", async (req, res) => {
  const farms = await Farm.find({});
  res.render("farms/index", { farms });
});

// route to create new farm:
app.get("/farms/new", (req, res) => {
  // notice how /farms/new should come before /farms/:id,
  // because we dont express to consider "new" as id
  res.render("farms/new");
});

// route to show details of 1 farm:
app.get("/farms/:id", async (req, res) => {
  // populate() "products" so we can list all products in farm details page:
  const farm = await Farm.findById(req.params.id).populate("products");
  res.render("farms/show", { farm });
});

// route to delete 1 farm:
app.delete("/farms/:id", async (req, res) => {
  const farm = await Farm.findByIdAndDelete(req.params.id);

  res.redirect("/farms");
});

// post route to create 1 farm:
app.post("/farms", async (req, res) => {
  const farm = new Farm(req.body);
  await farm.save();
  res.redirect("/farms");
});

// route to create new products on a farm:
app.get("/farms/:id/products/new", async (req, res) => {
  // getting farm id from params:
  const { id } = req.params;
  // finding farm by id
  const farm = await Farm.findById(id);
  // passing product categories and target farm into our ejs and rendering it:
  res.render("products/new", { categories, farm });
});

// IMPORTANT!
// post route to create 1 product on a farm.
app.post("/farms/:id/products", async (req, res) => {
  // getting farm id from params:
  const { id } = req.params;
  // finding farm by id
  const farm = await Farm.findById(id);
  // destructuring product values from request body of post request:
  const { name, price, category } = req.body;
  // creating a new product and pushing it to our target farm's product array:
  const product = new Product({ name, price, category });

  // pushing productid into our products array in farm document:
  farm.products.push(product);
  // setting target farm in our product
  // notice that we are embedding objectid on both sides:
  // farm as well as product! (2 way referencing)
  product.farm = farm;

  // notice that we are only pushing objectid of product into our array,
  // but mongoose will show current product values being stored in "farm" variable when you console.log(farm) / res.send(farm) farm after this.
  // This is because product values are already here in this scope and mongoose do not have to query the database for it.
  // but in reality when you go to mongo shell and see the data there,
  // you will realise that this farm document only contains objectid of product and you will have to populate the objectid
  // But in reality, we are only pushing product

  // save both farm and product and redirect to show page of target farm:
  await farm.save();
  await product.save();
  res.redirect(`/farms/${id}`);
});

// IMPORTANT NOTE:
// As a final test, make sure you go to mongo shell to check whether your queries are storing object values or just objectid in your mongodb's document.

// PRODUCT ROUTES

app.get("/products", async (req, res) => {
  const { category } = req.query;
  if (category) {
    const products = await Product.find({ category });
    res.render("products/index", { products, category });
  } else {
    const products = await Product.find({});
    res.render("products/index", { products, category: "All" });
  }
});

app.get("/products/new", (req, res) => {
  res.render("products/new", { categories });
});

app.post("/products", async (req, res) => {
  const newProduct = new Product(req.body);
  await newProduct.save();
  res.redirect(`/products/${newProduct._id}`);
});

app.get("/products/:id", async (req, res) => {
  const { id } = req.params;
  // get a product by id and populate it with farm name only (using objectid of that farm).
  const product = await Product.findById(id).populate("farm", "name");
  res.render("products/show", { product });
});

app.get("/products/:id/edit", async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  res.render("products/edit", { product, categories });
});

app.put("/products/:id", async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByIdAndUpdate(id, req.body, {
    runValidators: true,
    new: true
  });
  res.redirect(`/products/${product._id}`);
});

app.delete("/products/:id", async (req, res) => {
  const { id } = req.params;
  const deletedProduct = await Product.findByIdAndDelete(id);
  res.redirect("/products");
});

app.listen(3000, () => {
  console.log("APP IS LISTENING ON PORT 3000!");
});
