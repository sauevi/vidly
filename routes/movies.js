const express = require('express');
const router = express.Router();
const { Movie, validate } = require('../schemas/movie');
const { Genre } = require('../schemas/genre');
const debug = require('debug')('app:movies');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
/**
 * get all movies
 */

router.get('/', async (req, res) => {
  try {
    let movies = await Movie.find().select('-__v');
    return res.json(movies);
  } catch (error) {
    debug('Error Getting all movies');
    return res.status(505).json({ message: 'Internal server error' });
  }
});

/**
 * get a movie by id
 */
router.get('/:id', async (req, res) => {
  try {
    let movie = Movie.findById(req.params.id).select('-__v');

    if (!movie)
      return res
        .status(404)
        .json({ message: `Movie with id ${req.params.id} Not Found` });

    return res.json(movie);
  } catch (error) {
    debug(`Error getting a Movie with id ${req.params.id}`, error);
    return res.status(505).json({ message: 'Internal server error' });
  }
});

/**
 * create a new movie
 */
router.post('/', [auth, admin], async (req, res) => {
  const { error } = validate(req.body);

  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
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

    return res.json(movie);
  } catch (error) {
    debug('Error posting a new Movie', error);
    return res.status(505).json({ message: 'Internal server error' });
  }
});

/**
 * delete a movie from database
 */
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Delete successfully' });
  } catch (error) {
    debug(`Error deleting a Movie with id ${req.params.id}`, error);
    return res.status(505).json({ message: 'Internal server error' });
  }
});

module.exports = router;
