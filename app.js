const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
// const catchAsync = require("./utils/catchAsync");
// const Campground = require("./models/campground");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError");
// const Review = require("./models/review");
// const { campgroundSchema, reviewSchema } = require("./schemas.js");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

// const validateCampground = (req, res, next) => {
//   const { error } = campgroundSchema.validate(req.body);

//   if (error) {
//     const msg = error.details.map((el) => el.message).join(", ");
//     throw new ExpressError(msg, 400);
//   }

//   next();
// };

app.get("/", (req, res) => {
  res.render("home");
});

// const validateReview = (req, res, next) => {
//   const { error } = reviewSchema.validate(req.body);
//   if (error) {
//     const msg = error.details.map((el) => el.message).join(", ");
//     throw new ExpressError(msg, 400);
//   }

//   next();
// };

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  if (!err.message) err.message = "Looks like you wandered off the trail";
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("Serving on Port 3000");
});
