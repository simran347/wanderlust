const express = require("express");
const router = express.Router({mergeParams: true});
const expressError = require("../utils/expressError.js");
const wrapAsyncs = require("../utils/wrapAsyncs.js");
const Review = require("../models/reviews.js");
const Listing = require("../models/listing.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");


const reviewController = require("../controllers/reviews.js");
const review = require("../models/reviews.js");

//Reviews
//Post REVIEW route
router.post("/", isLoggedIn, validateReview, wrapAsyncs(reviewController.createreview));

//delete review route

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsyncs(reviewController.destroyreview));

module.exports = router;