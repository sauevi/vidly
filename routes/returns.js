const express = require('express');
const router = express.Router();
const { Rental, validate } = require('../schemas/rental');
const { Movie } = require('../schemas/movie');
const auth = require('../middleware/auth');
const handler = require('../middleware/handler');
const _ = require('lodash');

router.post(
  '/',
  auth,
  handler(async (req, res) => {
    //validate body
    const { error } = validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const request = _.pick(req.body, ['customerId', 'movieId']);

    const rental = await Rental.lookup(request.customerId, request.movieId);

    //validate rental found
    if (!rental) {
      return res.status(404).json({ error: 'not rental found' });
    }

    //validate rental doesn't have a date returned
    if (rental.dateReturned) {
      return res.status(400).json({ error: 'Return already processed' });
    }

    rental.movieReturned();
    await rental.save();

    await Movie.findByIdAndUpdate(rental.movie._id, {
      $inc: { numberInStock: 1 }
    });

    return res.json(
      _.pick(rental, [
        '_id',
        'customer',
        'movie',
        'dateOut',
        'dateReturned',
        'rentalFee'
      ])
    );
  })
);

module.exports = router;
