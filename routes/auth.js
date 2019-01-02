const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Joi = require('joi');
const { User } = require('../schemas/user');
const handler = require('../middleware/handler');
/*
login user
*/
router.post(
  '/',
  handler(async (req, res) => {
    const { error } = validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    let user = await User.findOne({ email: req.body.email });

    if (!user)
      return res.status(400).json({ message: 'Invalid email or password' });

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validPassword)
      return res.status(400).json({ message: 'Invalid email or password' });

    const token = user.generateAuthToken();
    res.json({ token: token });
  })
);

function validate(req) {
  const schema = {
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .min(8)
      .max(24)
      .required()
  };
  return Joi.validate(req, schema);
}

module.exports = router;
