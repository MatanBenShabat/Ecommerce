const mongoose = require("mongoose");
const AppError = require("../Utils/appError");
const ProductsScheme = mongoose.Schema(
  {
    image: {
      type: String,
      required: [true, "A product must have an image"],
      trim: true,
    },
    productsName: {
      type: String,
      unique: [true, "Name already exists"],
      required: [true, "A product must have a name"],
      minlength: [
        2,
        " A productsname must have more or equal then 2 characters",
      ],
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
      required: [true, "A product must have a brand"],
    },
    price: { type: Number, required: [true, "A product must have a price"] },
    rating: {
      type: Number,
      default: 5,
      max: [5, "Rating must be below 5"],
      min: [1, "Rating must be above 5"],
    },
    description: {
      type: String,
      required: [true, "A product must have a description"],
      maxlength: [200, "Description should not be longer then 200 charachters"],
    },
    currentBid: {
      type: Number,
      default: 0,
    },
    currentBidder: { type: String, default: "No One Yet" },
    seller: String,
    winner: { type: String, default: "No bidders for this product" },
    createDate: { type: Date, default: Date.now() },
    isActive: { type: Boolean, default: true },
    endOfAuctionDate: {
      type: Date,
      default: Date.now() + 1000 * 60 * 60 * 24 * 3,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ProductsScheme.virtual("priceInShekels").get(function () {
  return this.price * 3.14;
});

// ProductsScheme.pre(/^find/, function (next) {
//   this.find({ isActive: { $ne: false } });

//   next();
// });

ProductsScheme.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { isActive: { $ne: false } } });
  next();
});

ProductsScheme.methods.bidValidation = function (newBid) {
  let isHigher = false;

  if (this.currentBid < 100) {
    isHigher = this.currentBid + 5 <= newBid;
  } else {
    isHigher = this.currentBid + 50 <= newBid;
  }
  return isHigher;
};

ProductsScheme.methods.allowDeletion = function (sellerName,next) {
  if (sellerName === this.seller) {
    // this.isActive = false;
  return true;
  }else{
    return false
  }
};

const Products = mongoose.model("Products", ProductsScheme);
module.exports = Products;
