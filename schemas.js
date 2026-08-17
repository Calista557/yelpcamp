const Joi = require("joi");

module.exports.campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required().min(3).messages({
      "string.empty": "Title is required",
      "string.min": "Title must be at least 3 characters",
    }),

    location: Joi.string().required().min(3).messages({
      "string.empty": "Location is required",
      "string.min": "Location must be at least 3 characters",
    }),

    price: Joi.number().required().min(0).messages({
      "number.base": "Price must be a number",
      "number.min": "Price cannot be negative",
    }),

    description: Joi.string().required().min(10).messages({
      "string.empty": "Description is required",
      "string.min": "Description must be at least 10 characters",
    }),

    images: Joi.string().required().messages({
      "string.empty": "Image URL is required",
    }),
  }).required(),
});
