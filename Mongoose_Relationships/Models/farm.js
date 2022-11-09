const mongoose = require("mongoose");
const { Schema } = mongoose;

mongoose
  .connect("mongodb://localhost:27017/relationshipDemo", {
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

const productSchema = new Schema({
  name: String,
  price: Number,
  season: {
    type: String,
    enum: ["Spring", "Summer", "Fall", "Winter"]
  }
});

const farmSchema = new Schema({
  name: String,
  city: String,
  // array of object id's from product collection!
  products: [{ type: Schema.Types.ObjectId, ref: "Product" }]
});

const Product = mongoose.model("Product", productSchema);
const Farm = mongoose.model("Farm", farmSchema);

// Product.insertMany([
//     { name: 'Goddess Melon', price: 4.99, season: 'Summer' },
//     { name: 'Sugar Baby Watermelon', price: 4.99, season: 'Summer' },
//     { name: 'Asparagus', price: 3.99, season: 'Spring' },
// ])

// ONE TO MANY RELATIONSHIP:

// tedious way of "populating" the parent object with child objectid:

const makeFarm = async () => {
  const farm = new Farm({ name: "Full Belly Farms", city: "Guinda, CA" });
  const melon = await Product.findOne({ name: "Goddess Melon" });
  farm.products.push(melon);
  await farm.save();
  console.log(farm);
};

const addProduct = async () => {
  const farm = await Farm.findOne({ name: "Full Belly Farms" });
  const watermelon = await Product.findOne({ name: "Sugar Baby Watermelon" });
  farm.products.push(watermelon);
  await farm.save();
  console.log(farm);
};

// less tedious way of populating the parent object with child object values:

// populate() does the job of populating the parent document with the values of child document by using the objectId of child which was stored as an array in parent.

Farm.findOne({ name: "Full Belly Farms" })
  .populate("products")
  .then(farm => console.log(farm));
