const express = require('express');
const router = express.Router();
const debug = require('debug')('app:customers');
const JSONStream = require('JSONStream');
const {
  Customer,
  validateCustomer,
  validateUpdateCustomer
} = require('../schemas/customer');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

/**
 * get all custumers
 */
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ name: 1 });
    res.json(customers);
  } catch (err) {
    for (field in err.errors) {
      debug(err.errors[field].message);
      return res.json(err.errors[field].message);
    }
  }
});

/**
 * get a custumer by id
 */
router.get('/:id', auth, async (req, res) => {
  try {
    let customer = await Customer.findById(req.params.id);
    if (!customer)
      return res
        .status(404)
        .json(`customer with id: ${req.params.id}, not found`);

    res.json(customer);
  } catch (error) {
    for (field in err.errors) {
      debug(err.errors[field].message);
      return res.json(err.errors[field].message);
    }
  }
});
/**
 * create a new custumer object
 */
router.post('/', [auth, admin], async (req, res) => {
  //validate object
  var { error } = validateCustomer(req.body);

  if (error) return res.status(400).json(error.details[0].message);

  try {
    const customer = new Customer({
      name: req.body.name,
      phone: req.body.phone,
      isGold: req.body.isGold
    });

    await customer.save();
    return res.json(customer);
  } catch (err) {
    for (field in err.errors) {
      debug(err.errors[field].message);
      return res.json(err.errors[field].message);
    }
  }
});
/**
 * update a custumer object
 */
router.put('/:id', [auth, admin], async (req, res) => {
  var { error } = validateUpdateCustomer(req.body);

  if (error) {
    for (field in error.details) {
      debug(error.details[field].message);
      return res.json(error.details[field].message);
    }
  }

  var customerUpdt = {};

  if (req.body.name) customerUpdt.name = req.body.name;
  if (req.body.isGold) customerUpdt.isGold = req.body.isGold;
  if (req.body.phone) customerUpdt.phone = req.body.phone;

  try {
    let updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        $set: customerUpdt
      },
      {
        new: true
      }
    );

    if (!updatedCustomer)
      return res
        .status(404)
        .json({ message: `customer with id ${req.params.id} not found` });

    return res.json(updatedCustomer);
  } catch (err) {
    for (field in err.errors) {
      debug(err.errors[field].message);
      return res.json(err.errors[field].message);
    }
  }
});
/**
 * delete a custumer
 */
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    return res.json({
      message: 'delete successfully'
    });
  } catch (error) {
    return res.json(error.errors.message);
  }
});

module.exports = router;
