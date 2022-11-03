const Products = require("../models/productsModel");
const APIFeatures = require("../Utils/apiFeatures");
const AppError = require("../Utils/appError");
const AuctionTimers = require("../Utils/AuctionTimers");
const catchAsync = require("../Utils/catchAsync");

exports.aliasTopProducts = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "price";
  req.query.fields = "productsName,price,image";
  next();
};
exports.getProducts = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Products.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const products = await features.query;
  res.status(200).json({
    status: "success",
    results: products.length,
    data: {
      products,
    },
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Products.findById(req.params.id);
  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
});

exports.createProduct = catchAsync(async (req, res, next) => {
  const newProduct = await Products.create(req.body);

  AuctionTimers.addProduct(newProduct);

  res.status(201).json({
    status: "success",
    data: {
      product: newProduct,
    },
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  updatedProduct = await Products.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedProduct) {
    return next(new AppError("No product found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      product: updatedProduct,
    },
  });
});
exports.updateBid = catchAsync(async (req, res, next) => {
  newBid = req.body.currentBid;
  if (!newBid) return next(new AppError("Please place bid!", 400));

  const product = await Products.findById(req.params.id);
  if (!product) return next(new AppError("No product found with that ID", 404));

  const isHigher = product.bidValidation(newBid);

  if (!isHigher)
    return next(
      new AppError("The bid must be greater than the current bid", 406)
    );

  if (isHigher) {
    updatedProduct = await Products.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
  }

  if (!updatedProduct) {
    return next(new AppError("No product found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      product: updatedProduct,
    },
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Products.findById(req.params.id);

  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }

  const checkUsername = await product.allowDeletion(req.user.username);
  // .save({ validateModifiedOnly: true });
  console.log(checkUsername);
  checkUsername && AuctionTimers.cancleTimer(product._id);

  checkUsername && (await Products.findByIdAndDelete(req.params.id));

  checkUsername &&
    res.status(204).json({
      status: "success",
    });

  if(!checkUsername) {
    return next(new AppError("You do not have permission to delete this product", 401))};
});

exports.getProductsStats = catchAsync(async (req, res, next) => {
  const stats = await Products.aggregate([
    {
      $match: { rating: { $gte: 4 } },
    },
    {
      $group: {
        _id: { $toUpper: "$brand" },
        numProducts: { $sum: 1 },
        avgRating: { $avg: "$rating" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
        products: { $push: "$productsName" },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);
  res.status(200).json({
    status: "success",
    results: stats.length,
    data: {
      stats,
    },
  });
});
