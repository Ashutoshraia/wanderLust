const express = require("express");
const router = express.Router();
const WrapAsync = require('../util/WrapAsync.js');
const ExpressError = require('../util/ExpressError.js');
const { listingSchema,reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const {isLoggedIn,isOwner,validateListing} = require("../middleware");

const listingController = require("../controllers/listings.js");
const multer  = require('multer');

const { storage } = require("../cloudconfig.js");
const upload = multer({ storage })
 

router
.route("/")
 . get(WrapAsync(listingController.index))
 .post(
  isLoggedIn,
  upload.single("listing[image]"),
  validateListing,
  WrapAsync(listingController.createListing)
 );


 //new route
router.get("/new",isLoggedIn,listingController.rendernewform);


router
.route("/:id")
  .get(WrapAsync(listingController.showListing))
  .put( isLoggedIn,isOwner, upload.single("listing[image]"),validateListing,WrapAsync(listingController.updateListing))
  .delete(isLoggedIn,isOwner,WrapAsync(listingController.deleteListing));


 


//edit route
router.get("/:id/edit",isLoggedIn,isOwner,WrapAsync(listingController.renderEditform));


module.exports = router;