const express = require("express");
const productsController = require("../controllers/productsController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .get(
    "/top-5-cheap",authController.protect,
    productsController.aliasTopProducts,
    productsController.getProducts
  )
  .get("/products-stats",authController.protect, productsController.getProductsStats)
  .get("/name-and-brand",authController.protect, productsController.getNameAndBrand)
  .get("/home-page-products",productsController.getHomePageProducts)

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
  .delete(
    "/products/?:id",
    authController.protect,
    authController.restrictTo("admin", "seller"),
    productsController.deleteProduct
  );

module.exports = router;
