const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const geocodeListing = async (listing) => {
    const response = await geocodingClient
        .forwardGeocode({
            query: [listing.location, listing.country].filter(Boolean).join(", "),
            limit: 1,
        })
        .send();
    const geometry = response.body.features[0]?.geometry;
    const coordinates = geometry?.coordinates;

    if (geometry?.type !== "Point"
        || !Array.isArray(coordinates)
        || coordinates.length !== 2
        || !coordinates.every(Number.isFinite)) {
        return null;
    }

    return geometry;
};

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");

}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await
        Listing.findById(id)
            .populate({
                path: "reviews", populate: {
                    path: "author",
                },
            })
            .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested does not exist");
        return res.redirect("/listings");
    }
    const coordinates = listing.geometry?.coordinates;
    if (!Array.isArray(coordinates)
        || coordinates.length !== 2
        || !coordinates.every(Number.isFinite)) {
        const geometry = await geocodeListing(listing);
        if (geometry) {
            listing.geometry = geometry;
            await listing.save();
        } else {
            req.flash("error", "Could not find map coordinates for this listing.");
        }
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
}

module.exports.createListing = async (req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    const geometry = await geocodeListing(newListing);
    if (!geometry) {
        req.flash("error", "Could not find map coordinates for that location. Please check the location and country.");
        return res.redirect("/listings/new");
    }
    newListing.geometry = geometry;


    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "Successfully listing created !");
    res.redirect("/listings");
}

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested does not exist");
        return res.redirect("/listings");
    }

    res.render("listings/edit.ejs", { listing });

}

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { runValidators: true });
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    req.flash("success", "listing updated!");
    res.redirect(`/listings/${id}`);

}


module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    if (!deletedListing) {
        req.flash("error", "Listing deleted !");
        return res.redirect("/listings");
    }
    req.flash("success", "listing deleted!");
    res.redirect("/listings");
}