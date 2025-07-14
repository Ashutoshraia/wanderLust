const express = require("express");
const router = express.Router({mergeParams: true});
const WrapAsync = require('../util/WrapAsync.js');
const ExpressError = require('../util/ExpressError.js');
//const { listingSchema,reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview,isLoggedIn,isReviewAuthor} = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");

//post route
router.post("/",isLoggedIn,validateReview,WrapAsync(reviewController.createReview));
     


//Delete review Route
 router.delete("/:reviewId",isLoggedIn,isReviewAuthor,WrapAsync(reviewController.destroyReview))

module.exports = router;