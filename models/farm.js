const mongoose = require("mongoose");
const Product = require("./product");
const { Schema } = mongoose;

const farmSchema = new Schema({
  name: {
    type: String,
    required: [true, "Farm must have a name!"]
  },
  city: {
    type: String
  },
  email: {
    type: String,
    required: [true, "Email required"]
  },
  products: [
    {
      type: Schema.Types.ObjectId, // embedding objectid on both sides farm as well as product! (2 way referencing)
      ref: "Product"
    }
  ]
});

// DELETE ALL ASSOCIATED PRODUCTS AFTER A FARM IS DELETED
farmSchema.post("findOneAndDelete", async function (farm) {
  if (farm.products.length) {
    const res = await Product.deleteMany({ _id: { $in: farm.products } });
    console.log(res);
  }
});

// What we're doing here is creating and exporting the Farm model.
// This makes it so we can import the model into other parts of the program, like our routes
const Farm = mongoose.model("Farm", farmSchema);
module.exports = Farm;
