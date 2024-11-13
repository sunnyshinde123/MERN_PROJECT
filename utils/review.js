const Joi = require("joi");

module.exports.reviewSchema=Joi.object({
  review:Joi.object({
    rating:Joi.string().default(3).min(1).max(5),
    comment:Joi.string().required(),
    created_At:Joi.date().default(Date.now())
  }).required()
});