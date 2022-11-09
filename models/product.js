const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    lowercase: true,
    enum: ["fruit", "vegetable", "dairy"]
  },
  farm: {
    type: Schema.Types.ObjectId, // embedding objectid on both sides farm as well as product! (2 way referencing)
    ref: "Farm"
  }
});

// What we're doing here is creating and exporting the Product model.
// This makes it so we can import the model into other parts of the program, like our routes
const Product = mongoose.model("Product", productSchema);
module.exports = Product;
