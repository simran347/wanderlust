const Listing = require("./models/listing.js");
const Review = require("./models/reviews.js");
const expressError = require("./utils/expressError.js");
const {listingSchema, reviewSchema} = require("./schema.js");




module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be signed in first !");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested does not exist");
        return res.redirect("/listings");
    }
    if (!req.user || String(listing.owner) !== String(req.user._id)) {
        req.flash("error", "sorry you are not the owner of this listing!");
        return res.redirect(`/listings/${id}`);
    }
    return next();
}

module.exports.validateListing = (req, res, next) =>{
    let {error} = listingSchema.validate(req.body);
        if(error){
            let errMsg = error.details.map((el) => el.message).join(",");
            throw new expressError(400, errMsg);
        }else{
            next();
        }
};

module.exports.setListingImage = async (req, res, next) => {
    if (req.file) {
        req.body.listing = req.body.listing || {};
        req.body.listing.image = {
            filename: req.file.filename,
            url: req.file.path,
        };
    } else if (req.method === "PUT") {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            throw new expressError(404, "Listing you requested does not exist");
        }
        req.body.listing = req.body.listing || {};
        req.body.listing.image = {
            filename: listing.image.filename,
            url: listing.image.url,
        };
    }
    return next();
};

module.exports.validateReview = (req, res, next) =>{
    let {error} = reviewSchema.validate(req.body);
        if(error){
            let errMsg = error.details.map((el) => el.message).join(",");
            throw new expressError(400, errMsg);
        }else{
            next();
        }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    try {
        let review = await Review.findById(reviewId);
        if (
            !review ||
            !review.author ||
            !req.user ||
            String(review.author) !== String(req.user._id)
        ) {
            req.flash("error", "sorry you are not the owner of this review!");
            return res.redirect(`/listings/${id}`);
        }
        return next();
    } catch (error) {
        return next(error);
    }
}