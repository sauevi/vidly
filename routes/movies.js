const express = require('express');
const router = express.Router();
const { Movie, validate } = require('../schemas/movie');
const { Genre } = require('../schemas/genre');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const handler = require('../middleware/handler');
const _ = require('lodash');
const validateObjectId = require('../middleware/validateObjectId');
/**
 * get all movies
 */

router.get(
  '/',
  handler(async (req, res) => {
    let movies = await Movie.find().select('-__v');
    return res.json(movies);
  })
);

/**
 * get a movie by id
 */
router.get(
  '/:id',
  validateObjectId,
  handler(async (req, res) => {
    let movie = Movie.findById(req.params.id).select('-__v');

    if (!movie)
      return res
        .status(404)
        .json({ message: `Movie with id ${req.params.id} Not Found` });

    return res.json(movie);
  })
);

/**
 * create a new movie
 */
router.post(
  '/',
  [auth, admin],
  handler(async (req, res) => {
    const { error } = validate(req.body);

    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const genre = await Genre.findById(req.body.genreId);

    if (!genre) return res.status(400).json({ message: 'Invalid genre' });

    const movie = new Movie({
      title: req.body.title,
      genre: {
        _id: genre._id,
        name: genre.name
      },
      numberInStock: req.body.numberInStock,
      dailyRentalRate: req.body.dailyRentalRate
    });

    await movie.save();

    return res.json(
      _.pick(movie, ['title', 'genre', 'numberInStock', 'dailyRentalRate'])
    );
  })
);

/**
 * delete a movie from database
 */
router.delete(
  '/:id',
  [validateObjectId, auth, admin],
  handler(async (req, res) => {
    await Movie.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Delete successfully' });
  })
);

module.exports = router;
