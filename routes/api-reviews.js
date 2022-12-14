const express = require("express");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router.use(authController.protect)

router
  .route("/")
  .get(reviewController.getAllReviews)
  .post(reviewController.createReview);

router.route("/:id").delete(reviewController.deleteReview)

module.exports = router;
