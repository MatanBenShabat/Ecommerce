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

exports.getHomePageProducts = catchAsync(async (req, res) => {
  const products = await Products.find()
    .limit(3)
    .select("productsName image price currentBid createDate endOfAuction");
  res.status(200).json({
    status: "success",
    data: {
      products,
    },
  });
});

exports.getProducts = catchAsync(async (req, res, next) => {
  // const filteredProducts = new APIFeatures(Products.find(), req.query).filter();
  const [features, count] = new APIFeatures(Products.find(), req.query)
    .filter()
    .count()
    .sort()
    .limitFields()
    .paginate()
    .getQueries();

  const [allProducts, length] = await Promise.all([features, count]);
  let products = [];
  allProducts.forEach((item) => {
    if (item.isActive === false && item.seller === req.user.username)
      products.push(item);
    if (item.isActive === true) products.push(item);
  });

  res.status(200).json({
    status: "success",
    length,
    data: {
      products,
    },
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Products.findById(req.params.id, (err) => {
    if (err) {
      return next(new AppError("No product found with that ID", 404));
    }
  })
    .populate("reviews")
    .clone();

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
  console.log("here");
  const product = await Products.findById(req.params.id, (err) => {
    if (err) {
      return next(new AppError("No product found with that ID", 404));
    }
  }).clone();

  if (
    req.body.winner ||
    req.body.currentBidder ||
    req.body.endOfAuctionDate ||
    req.body.createDate ||
    req.body._id
  )
    return next(
      new AppError("You do not have permission to perform this action", 401)
    );

  const checkUsername = await product.allowDeletion(req.user.username);

  checkUsername &&
    (await Products.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).clone());

  checkUsername &&
    res.status(200).json({
      status: "success",
    });

  if (!checkUsername) {
    return next(
      new AppError("You do not have permission to update this product", 401)
    );
  }
});

exports.updateRating = catchAsync(async (req, res, next) => {
  await Products.findByIdAndUpdate(
    req.params.id,
    { rating: req.body.rating },
    {
      new: true,
      runValidators: true,
    },
    (err) => {
      if (err) {
        return next(new AppError("No product found with that ID", 404));
      }
    }
  ).clone();

  res.status(200).json({
    status: "success",
  });
});

exports.updateBid = catchAsync(async (req, res, next) => {
  newBid = req.body.currentBid;
  if (!newBid) return next(new AppError("Please place bid!", 400));

  const product = await Products.findById(req.params.id, (err) => {
    if (err) {
      return next(new AppError("No product found with that ID", 404));
    }
  }).clone();

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
  res.status(200).json({
    status: "success",
    data: {
      product: updatedProduct,
    },
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Products.findById(req.params.id, (err) => {
    if (err) {
      return next(new AppError("No product found with that ID", 404));
    }
  }).clone();

  const checkUsername = await product.allowDeletion(req.user.username);
  checkUsername && AuctionTimers.cancleTimer(product._id);

  checkUsername && (await Products.findByIdAndDelete(req.params.id));

  checkUsername &&
    res.status(204).json({
      status: "success",
    });

  if (!checkUsername) {
    return next(
      new AppError("You do not have permission to delete this product", 401)
    );
  }
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

exports.getNameAndBrand = catchAsync(async (req, res, next) => {
  const allNameAndBrand = await Products.find().select(
    "brand productsName isActive seller"
  );
  let nameAndBrand = [];
  allNameAndBrand.forEach((item) => {
    if (item.isActive === false && item.seller === req.user.username)
      nameAndBrand.push(item);
    if (item.isActive === true) nameAndBrand.push(item);
  });
  res.status(200).json({
    status: "success",
    data: {
      ...nameAndBrand,
    },
  });
});
