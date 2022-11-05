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
  .get("/name-and-brand",authController.protect, productsController.getNameAndBrand);

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
    "/products/:id",
    authController.protect,
    productsController.updateBid
  )
  .delete(
    "/products/?:id",
    authController.protect,
    authController.restrictTo("admin", "seller"),
    productsController.deleteProduct
  );

module.exports = router;
