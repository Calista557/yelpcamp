const mongoose = require("mongoose");
const cities = require("./cities");
const {
  places,
  descriptors,
  buildDescription,
  images,
} = require("./seedHelpers");
const Campground = require("../models/campground");

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const sampleImages = (array) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  const numberOfImages = Math.floor(Math.random() * 3) + 2;

  return shuffled.slice(0, numberOfImages);
};

const seedDB = async () => {
  await Campground.deleteMany({});

  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);

    const camp = new Campground({
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description: buildDescription(
        cities[random1000].city,
        cities[random1000].state,
      ),
      images: sampleImages(images),
      price: (Math.floor(Math.random() * 96) + 5) * 500,
    });

    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
