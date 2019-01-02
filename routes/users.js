const express = require('express');
const router = express.Router();
const { User, validate } = require('../schemas/user');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const handler = require('../middleware/handler');

// create a new user
router.post(
  '/',
  handler(async (req, res) => {
    const { error } = validate(req.body);

    if (error)
      return res.status(400).json({ message: error.details[0].message });

    let user = await User.findOne({ email: req.body.email });

    if (user)
      return res.status(400).json({ message: 'User already registered.' });

    user = new User(_.pick(req.body, ['name', 'email', 'password']));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();

    return res.json(_.pick(user, ['_id', 'name', 'email']));
  })
);

//get the current user
router.get(
  '/me',
  auth,
  handler(async (req, res) => {
    const user = await User.findById(req.user._id);
    res.json(_.pick(user, ['_id', 'name', 'email']));
  })
);
module.exports = router;
