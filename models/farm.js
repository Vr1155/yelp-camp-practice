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

// IMPORTANT!
// DELETE ALL ASSOCIATED PRODUCTS AFTER A FARM IS DELETED:

// we also want related products to be deleted when a farm is deleted.
// it can be done with ease using "pre" and "post" middleware.

// "pre" is a middleware which runs before a target middleware is run,
// "post" runs after a target middleware is run.
// in "pre" we dont have access to the data which target middleware has access to.
// however, in post middleware we have access to the data which target middleware had access to.
// That data which is passed to post middleware is the farm document which was deleted.
// we can get the objectid of all products in that farm document and use that to delete all products which were related to that farm.

// notice that "findByIdAndDelete" triggers "findOneAndDelete",
// and we can use "post" in "findOneAndDelete"

farmSchema.post("findOneAndDelete", async function (farm) {
  if (farm.products.length) {
    // get objectid of all products in farm document's product array, and delete them all.
    const res = await Product.deleteMany({ _id: { $in: farm.products } });
    // console.log to see how many products were found and how many were deleted:
    console.log(res);
  }
});

// It is highly recommended to read the mongoose documentation and experiment!

// What we're doing here is creating and exporting the Farm model.
// This makes it so we can import the model into other parts of the program, like our routes
const Farm = mongoose.model("Farm", farmSchema);
module.exports = Farm;
