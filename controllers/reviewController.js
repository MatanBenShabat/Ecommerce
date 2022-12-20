const Review = require("../models/reviewModel");
const AppError = require("../Utils/appError");
const AuctionTimers = require("../Utils/AuctionTimers");
const catchAsync = require("../Utils/catchAsync");
const factory = require("./factoryHandler")

exports.getAllReviews = catchAsync(async (req, res) => {
  let filter = {};
  if (req.params.productId) filter = {product: req.params.productId};

  const reviews = await Review.find(filter);
  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.createReview = catchAsync(async (req, res) => {
  //Allow nested routes
  if (!req.body.product) req.body.product = req.params.productId;
  req.body.user = req.user.id;

  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      review: newReview,
    },
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id, (err) => {
    if (err) {
      return next(new AppError("No review found with that ID", 404));
    }
  }).clone();

  const checkUsername = await review.allowDeletion(req.user._id.toHexString());

  checkUsername && (await Review.findByIdAndDelete(req.params.id));

  checkUsername &&
    res.status(204).json({
      status: "success",
    });


  if (!checkUsername) {
    return next(
      new AppError("You do not have permission to delete this review", 401)
    );
  }
});


