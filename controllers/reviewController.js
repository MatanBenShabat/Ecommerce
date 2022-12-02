const Review = require("../models/reviewModel");
const catchAsync = require("../Utils/catchAsync");

exports.getAllReviews = catchAsync(async (req, res) => {
  let filter = {};
  if (req.params.productsId) filter = req.params.productsId;

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
