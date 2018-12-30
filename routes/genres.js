const express = require('express');
const router = express.Router();
const debug = require('debug')('app:genre');
const { Genre, validateGenre } = require('../schemas/genre');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

var errors = [];
/**
 * get all genres
 */
router.get('/', async (req, res) => {
  try {
    let genres = await Genre.find().sort('name');
    return res.send(genres);
  } catch (err) {
    for (field in err.errors) {
      debug(err.errors[field].message);
      errors.push(err.errors[field].message);
    }
    return res.send(errors);
  }
});
/**
 * get genres by Id
 */
router.get('/:id', async (req, res) => {
  try {
    let genre = await Genre.findById(req.params.id);
    if (!genre)
      return res
        .status(404)
        .send(`Genre with id: ${req.params.id} doesn't exist`);

    return res.send(genre);
  } catch (err) {
    for (field in err.errors) {
      debug(err.errors[field].message);
      errors.push(err.errors[field].message);
    }
    return res.send(errors);
  }
});
/**
 * create new genre
 */
router.post('/', auth, async (req, res) => {
  const { error } = validateGenre(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  const genre = new Genre({
    name: req.body.name
  });

  try {
    await genre.save();
    return res.send(genre);
  } catch (err) {
    for (field in err.errors) {
      debug(err.errors[field].message);
      errors.push(err.errors[field].message);
    }
    return res.send(errors);
  }
});

/**
 * update a genre
 */
router.put('/:id', async (req, res) => {
  const { error } = validateGenre(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  try {
    let genre = await Genre.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name: req.body.name
        }
      },
      {
        new: true
      }
    );
    return res.send(genre);
  } catch (err) {
    for (field in err.errors) {
      debug(err.errors[field].message);
      errors.push(err.errors[field].message);
    }
    return res.send(errors);
  }
});

/**
 * delete a genre
 */
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    await Genre.findByIdAndRemove(req.params.id);
    return res.status(200).send('Successfull deleted');
  } catch (err) {
    for (field in err.errors) {
      debug(err.errors[field].message);
      errors.push(err.errors[field].message);
    }
    return res.send(errors);
  }
});

module.exports = router;
