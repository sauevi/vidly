const express = require('express');
const router = express.Router();
const { Rental, validate } = require('../schemas/rental');
const { Movie } = require('../schemas/movie');
const { Customer } = require('../schemas/customer');
const Fawn = require('fawn');
const debug = require('debug')('app:rental');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

Fawn.init(mongoose);

/**
 * create a new rental
 */
router.post('/', [auth], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const customer = await Customer.findById(req.body.customerId);
    if (!customer) return res.status(400).json({ error: 'Invalid customer.' });

    const movie = await Movie.findById(req.body.movieId);
    if (!movie) return res.status(400).json({ error: 'Invalid movie.' });

    if (movie.numberInStock === 0)
      return res.status(400).json({ error: 'Movie not available' });

    let rental = new Rental({
      customer: {
        _id: customer._id,
        name: customer.name,
        phone: customer.phone
      },
      movie: {
        _id: movie._id,
        title: movie.title,
        dailyRentalRate: movie.dailyRentalRate
      }
    });

    //using a transaction
    new Fawn.Task()
      .save('rental', rental)
      .update(
        'movies',
        { _id: movie._id },
        {
          $inc: { numberInStock: -1 }
        }
      )
      .run();

    return res.json(rental);
  } catch (error) {
    debug('Error posting a new rental', error);
    return res.status(500).json({ error: 'internal server error' });
  }
});

/**
 * get all rentals
 */
router.get('/', [auth], async (req, res) => {
  try {
    let rentals = await Rental.find().sort('-dateOut');
    res.json(rentals);
  } catch (error) {
    return res.status(500).json({
      message: 'Internal Server Error...'
    });
  }
});

module.exports = router;
