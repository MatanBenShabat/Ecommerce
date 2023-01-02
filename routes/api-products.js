const express = require("express");
const productsController = require("../controllers/productsController");
const authController = require("../controllers/authController");
const reviewRoutes = require("../routes/api-reviews");
const router = express.Router();

router.use("/:productId/reviews", reviewRoutes);

router.get("/home-page-products", productsController.getHomePageProducts);

router.use(authController.protect);

router
  .get(
    "/top-5-cheap",
    productsController.aliasTopProducts,
    productsController.getProducts
  )
  .get("/products-stats", productsController.getProductsStats)
  .get("/name-and-brand", productsController.getNameAndBrand);

router
  .get("/products", productsController.getProducts)
  .get("/products/:id", productsController.getProduct)
  .post(
    "/products",
    authController.restrictTo("admin", "seller"),
    productsController.createProduct
  )
  .patch("/products-bid/:id", productsController.updateBid)
  .patch("/products-rate/:id", productsController.updateRating)
  .patch(
    "/update-product/:id",
    authController.restrictTo("seller"),
    productsController.updateProduct
  )
  .delete(
    "/products/?:id",
    authController.restrictTo("admin", "seller"),
    productsController.deleteProduct
  );

module.exports = router;
