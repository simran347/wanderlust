const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

// require('dotenv').config();
// console.log(process.env.SECRET)
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const expressError = require("./utils/expressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo').MongoStore;
const listingRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js") ;
const userRouter = require("./routes/user.js");




// const dbUrl = process.env.ATLASDB_URL;


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));






const store = MongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("ERROR IN MONGO SESSION STORE", err);
});
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,  
    cookie : {
        expires: Date.now() + 7*24*60*0*60*1000,
        maxAge : 7*24*60*60*1000,
        httpOnly: true,
    }  
}
// app.get("/", (req, res) => {
//     res.redirect("/listings");
// });


app.use(session(sessionOptions));
app.use((req, res, next) => {
    req.flash = (type, message) => {
        const messages = req.session.flash || (req.session.flash = {});
        if (message !== undefined) {
            (messages[type] || (messages[type] = [])).push(message);
            return messages[type].length;
        }
        const queued = messages[type] || [];
        delete messages[type];
        return queued;
    };
    next();
});


passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user; 
    next();
} )

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

// app.get("/demouser", async(req,res) => {
//     let fakeUser = new User({
//         email: "atudent@gmail.com",
//         username: "delta-student"
//     });


//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// });



// app.get("/testListing", async (req, res) => {
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the beach",
//         price : 1200,
//         location : "India", 
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });
app.all("/{*splat}", (req, res, next) => {
    next(new expressError(404, "page not found"));
});

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    let {statusCode = 500, message="something went wrong!"} = err;
    // res.send("some thing went wrong! ")
    res.status(statusCode).render("error.ejs", {message});
    // res.render("error.ejs", {err});
});

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("MongoDB Atlas connected successfully");

        app.listen(8080, () => {
            console.log("Server listening on port 8080");
        });
    })
    .catch((err) => {
        console.error("MongoDB connection failed:", err.message);
    });