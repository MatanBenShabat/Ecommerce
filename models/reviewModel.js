const mongoose = require("mongoose");
const Products = require("./productsModel");

const ReviewScheme = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review can not be empty."],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Review must have a rating."],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Products",
      required: [true, "Review must belong to a product."],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "Users",
      required: [true, "Review must belong to a user."],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ReviewScheme.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "image username",
  });
  // this.populate({
  //   path: "product",
  //   select:"productsName"
  // })

  next();
});

ReviewScheme.methods.allowDeletion = function (candidateUserId, next) {
  const userId = this.user._id.toHexString();

  if (candidateUserId === userId) {
    return true;
  } else {
    return false;
  }
};

ReviewScheme.statics.calcAverageRatings = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: "$product",
        numRatings: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  // console.log(stats);
  await Products.findByIdAndUpdate(productId,{
    ratingsQuantity: stats[0].numRatings,
    rating: stats[0].avgRating
  })
};

ReviewScheme.post("save", function () {
  //this points to current review

  this.constructor.calcAverageRatings(this.product);
});

const Review = mongoose.model("Review", ReviewScheme);
module.exports = Review;
