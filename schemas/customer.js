const mongoose = require('mongoose');
const Joi = require('joi');

const Customer = mongoose.model(
  'customer',
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 50
    },
    phone: {
      type: String,
      required: true,
      match: /^\d+$/
    },
    isGold: {
      type: Boolean,
      default: false
    },
    createdOn: {
      type: Date,
      default: Date.now
    }
  })
);

/**
 * validate objects
 */

function validateCustomer(customer) {
  let customerValidator = Joi.object().keys({
    name: Joi.string()
      .min(3)
      .max(15)
      .required(),
    phone: Joi.string().regex(/^\d+$/),
    isGold: Joi.boolean().required()
  });
  return Joi.validate(customer, customerValidator);
}

function validateUpdateCustomer(customer) {
  let customerValidator = Joi.object().keys({
    name: Joi.string()
      .min(3)
      .max(15),
    phone: Joi.string()
      .regex(/^\d+$/)
      .min(10)
      .max(10),
    isGold: Joi.boolean()
  });
  return Joi.validate(customer, customerValidator);
}

exports.Customer = Customer;
exports.validateCustomer = validateCustomer;
exports.validateUpdateCustomer = validateUpdateCustomer;
