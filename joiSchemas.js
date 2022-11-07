const Joi = require("joi");

// exporting joi schema for Server side data validation :

module.exports.campgroundSchemaJoi = Joi.object({
  campground: Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required().min(0),
    image: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required()
  }).required()
});
