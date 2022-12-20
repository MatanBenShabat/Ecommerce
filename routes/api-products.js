const express = require("express");
const productsController = require("../controllers/productsController");
const authController = require("../controllers/authController");
const reviewRoutes = require("../routes/api-reviews");
const router = express.Router();

router.use("/:productId/reviews", reviewRoutes);

router
  .get(
    "/top-5-cheap",
    authController.protect,
    productsController.aliasTopProducts,
    productsController.getProducts
  )
  .get(
    "/products-stats",
    authController.protect,
    productsController.getProductsStats
  )
  .get(
    "/name-and-brand",
    authController.protect,
    productsController.getNameAndBrand
  )
  .get("/home-page-products", productsController.getHomePageProducts);

router
  .get("/products", authController.protect, productsController.getProducts)
  .get("/products/:id", productsController.getProduct)
  .post(
    "/products",
    authController.protect,
    authController.restrictTo("admin", "seller"),
    productsController.createProduct
  )
  .patch(
    "/products-bid/:id",
    authController.protect,
    productsController.updateBid
  )
  .patch(
    "/products-rate/:id",
    authController.protect,
    productsController.updateRating
  )
  .patch(
    "/update-product/:id",
    authController.protect,
    authController.restrictTo("seller"),
    productsController.updateProduct
  )
  .delete(
    "/products/?:id",
    authController.protect,
    authController.restrictTo("admin", "seller"),
    productsController.deleteProduct
  );

module.exports = router;
