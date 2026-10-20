const express = require("express");
const router = express.Router();
const wrapAsyncs = require("../utils/wrapAsyncs.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing, setListingImage } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer')
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage })

router
    .route("/")
    .get(wrapAsyncs(listingController.index))
    .post(isLoggedIn, 
        upload.single('listing[image]'),
        setListingImage,
        validateListing, 
        wrapAsyncs(listingController.createListing)
    );
    
//new route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
    .get(isLoggedIn, wrapAsyncs(listingController.showListing))
    .put(isLoggedIn, isOwner, upload.single('image'), setListingImage, validateListing,
        wrapAsyncs(listingController.updateListing))
    .delete(isLoggedIn, isOwner, (listingController.destroyListing));

//Edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsyncs(listingController.renderEditForm));


//index routing
// router.get("/", wrapAsyncs(listingController.index)  );
//show route
// router.get("/:id", isLoggedIn, wrapAsyncs (listingController.showListing))

//create route
// router.post("/", 
//     validateListing,
//     wrapAsyncs (listingController.createListing));
//update route
// router.put("/:id", isLoggedIn, isOwner, validateListing,
//     wrapAsyncs (listingController.updateListing));
//delete route
// router.delete("/:id", isLoggedIn,isOwner, (listingController.destroyListing));

module.exports = router;