const Joi = require("joi");

module.exports.campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required().min(3).trim().messages({
      "string.empty": "Title is required",
      "string.min": "Title must be at least 3 characters",
    }),

    location: Joi.string().required().min(3).trim().messages({
      "string.empty": "Location is required",
      "string.min": "Location must be at least 3 characters",
    }),

    price: Joi.number().required().min(0).messages({
      "number.base": "Price must be a number",
      "number.min": "Price cannot be negative",
    }),

    description: Joi.string().required().min(10).trim().messages({
      "string.empty": "Description is required",
      "string.min": "Description must be at least 10 characters",
    }),
  }).required(),

  deleteImages: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string()),
  ),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    body: Joi.string().required(),
  }).required(),
});
