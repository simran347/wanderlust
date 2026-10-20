const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./reviews.js");
const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        url: String,
        filename: String,
        // set : (v) => v === "" ? "https://imgs.search.brave.com/NukeF1el-g1Lr62evdCCmuWYHhOW2YCZ-xqA4EJbMcE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMzAv/MTY4LzQ5NS9zbWFs/bC9hLW1pbmlhdHVy/ZS13b29kZW4taG91/c2Utb24tdGhlLWJl/YWNoLXdpdGgtcGFs/bS10cmVlcy1haS1n/ZW5lcmF0ZWQtcGhv/dG8uanBn" : v,
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },

    // category:{
    //     type: String,
    //     enum: ["mountains", "arctic", "farm", "desert"],
    //     required:true,
    // }

});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;