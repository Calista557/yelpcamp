const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const opts = {
  toJSON: {
    virtuals: true,
  },
};

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const CampgroundSchema = new Schema(
  {
    title: String,

    images: [ImageSchema],

    price: Number,

    description: String,

    location: String,

    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },

      coordinates: {
        type: [Number],
        required: true,
      },
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts,
);

CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
  const image = this.images?.[0]?.url;

  return `
    <div style="width: 220px;">
      ${
        image
          ? `
            <img
              src="${image}"
              alt="${this.title}"
              style="
                width: 100%;
                height: 120px;
                object-fit: cover;
                border-radius: 6px;
                margin-bottom: 10px;
              "
            >
          `
          : ""
      }

      <h5 style="margin-bottom: 8px;">
        <a href="/campgrounds/${this._id}">
          ${this.title}
        </a>
      </h5>

      <p style="margin-bottom: 8px;">
        ${this.location}
      </p>

      <p style="margin-bottom: 10px;">
        ${this.description.substring(0, 80)}...
      </p>

      <p style="font-weight: bold; margin-bottom: 10px;">
        ₦${this.price.toLocaleString()}
      </p>

      <a
        href="/campgrounds/${this._id}"
        class="btn btn-primary btn-sm"
      >
        View Campground
      </a>
    </div>
  `;
});

CampgroundSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: { $in: doc.reviews },
    });
  }
});

CampgroundSchema.virtual("avgRating").get(function () {
  if (!this.reviews || this.reviews.length === 0) return 0;

  const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  return total / this.reviews.length;
});

module.exports = mongoose.model("Campground", CampgroundSchema);
