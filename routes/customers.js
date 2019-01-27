const express = require('express');
const router = express.Router();
const {
  Customer,
  validateCustomer,
  validateUpdateCustomer
} = require('../schemas/customer');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const handler = require('../middleware/handler');
const _ = require('lodash');
const validateObjectId = require('../middleware/validateObjectId');
/**
 * get all custumers
 */
router.get(
  '/',
  handler(async (req, res) => {
    const customers = await Customer.find().sort({ name: 1 });
    res.json(_.pick(customers, ['_id', 'name', 'phone', 'isGold']));
  })
);

/**
 * get a custumer by id
 */
router.get(
  '/:id',
  [validateObjectId, auth],
  handler(async (req, res) => {
    let customer = await Customer.findById(req.params.id);
    if (!customer)
      return res
        .status(404)
        .json(`customer with id: ${req.params.id}, not found`);

    res.json(_.pick(customers, ['_id', 'name', 'phone', 'isGold']));
  })
);
/**
 * create a new custumer object
 */
router.post(
  '/',
  [auth, admin],
  handler(async (req, res) => {
    //validate object
    var { error } = validateCustomer(req.body);

    if (error) return res.status(400).json(error.details[0].message);

    const customer = new Customer(
      _.pick(req.body, ['name', 'phone', 'isGold'])
    );

    await customer.save();
    return res.json(_.pick(customers, ['_id', 'name', 'phone', 'isGold']));
  })
);
/**
 * update a custumer object
 */
router.put(
  '/:id',
  [validateObjectId, auth, admin],
  handler(async (req, res) => {
    var { error } = validateUpdateCustomer(req.body);

    if (error) {
      for (field in error.details) {
        return res.json(error.details[field].message);
      }
    }

    var customerUpdt = {};

    if (req.body.name) customerUpdt.name = req.body.name;
    if (req.body.isGold) customerUpdt.isGold = req.body.isGold;
    if (req.body.phone) customerUpdt.phone = req.body.phone;

    let updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        $set: customerUpdt
      },
      {
        new: true
      }
    ).select('-__v');

    if (!updatedCustomer)
      return res
        .status(404)
        .json({ message: `customer with id ${req.params.id} not found` });

    return res.json(updatedCustomer);
  })
);
/**
 * delete a custumer
 */
router.delete(
  '/:id',
  [validateObjectId, auth, admin],
  handler(async (req, res) => {
    await Customer.findByIdAndDelete(req.params.id);
    return res.json({
      message: 'delete successfully'
    });
  })
);

module.exports = router;
