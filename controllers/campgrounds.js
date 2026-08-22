const Campground = require("../models/campground");
const ExpressError = require("../utils/ExpressError");
const { cloudinary } = require("../cloudinary");
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req, res) => {
  const { search = "" } = req.query;
  const campgrounds = await Campground.find({
    $or: [
      { title: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ],
  });
  res.render("campgrounds/index", {
    campgrounds,
    search,
  });
};
module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res) => {
  const geoData = await maptilerClient.geocoding.forward(
    req.body.campground.location,
    { limit: 1 },
  );
  if (!geoData.features?.length) {
    req.flash(
      "error",
      "Could not geocode that location. Please try again and enter a valid location.",
    );
    return res.redirect("/campgrounds/new");
  }
  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.features[0].geometry;
  campground.location = geoData.features[0].place_name;
  campground.images = req.files.map((file) => ({
    url: file.path,
    filename: file.filename,
  }));
  campground.author = req.user._id;
  await campground.save();
  req.flash("success", "Successfully created a new campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.renderEditForm = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    throw new ExpressError("Campground not found", 404);
  }
  res.render("campgrounds/edit", { campground });
};

module.exports.showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate("reviews")
    .populate("author");
  if (!campground) {
    throw new ExpressError("Campground not found", 404);
  }
  res.render("campgrounds/show", { campground });
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    throw new ExpressError("Campground not found", 404);
  }
  const geoData = await maptilerClient.geocoding.forward(
    req.body.campground.location,
    { limit: 1 },
  );
  if (!geoData.features?.length) {
    req.flash(
      "error",
      "Could not geocode that location. Please try again and enter a valid location.",
    );
    return res.redirect(`/campgrounds/${id}/edit`);
  }
  const deleteImages = req.body.deleteImages || [];
  const imagesToDelete = Array.isArray(deleteImages)
    ? deleteImages
    : [deleteImages];
  campground.images = campground.images.filter(
    (image) => !imagesToDelete.includes(image.filename),
  );
  const newImages = req.files ? req.files.length : 0;
  if (newImages > 0) {
    campground.images.push(
      ...req.files.map((file) => ({
        url: file.path,
        filename: file.filename,
      })),
    );
  }
  if (campground.images.length > 4) {
    req.flash("error", "You can only have 4 images total.");
    return res.redirect(`/campgrounds/${campground._id}/edit`);
  }
  Object.assign(campground, req.body.campground);
  campground.geometry = geoData.features[0].geometry;
  campground.location = geoData.features[0].place_name;
  await campground.save();
  for (let filename of imagesToDelete) {
    await cloudinary.uploader.destroy(filename);
  }
  req.flash("success", "Successfully updated the campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  await Campground.findByIdAndDelete(req.params.id);
  req.flash("success", "Successfully deleted the campground!");
  res.redirect("/campgrounds");
};
