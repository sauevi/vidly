const express = require('express');
const router = express.Router();
const { Genre, validateGenre } = require('../schemas/genre');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const handler = require('../middleware/handler');
const _ = require('lodash');
const validateObjectId = require('../middleware/validateObjectId');
/**
 * get all genres
 */
router.get(
  '/',
  auth,
  handler(async (req, res) => {
    let genres = await Genre.find()
      .sort('name')
      .select('-__v');
    return res.send(genres);
  })
);
/**
 * get genres by Id
 */
router.get(
  '/:id',
  [validateObjectId, auth],
  handler(async (req, res) => {
    const genre = await Genre.findById(req.params.id).select('-__v');

    if (!genre) {
      return res
        .status(404)
        .json({ message: `Genre with id: ${req.params.id} doesn't exist` });
    }

    return res.send(genre);
  })
);
/**
 * create new genre
 */
router.post(
  '/',
  auth,
  handler(async (req, res) => {
    const { error } = validateGenre(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const genre = new Genre(_.pick(req.body, ['name']));

    await genre.save();
    return res.json(_.pick(genre, ['_id', 'name']));
  })
);

/**
 * update a genre
 */
router.put(
  '/:id',
  [validateObjectId, auth],
  handler(async (req, res) => {
    const { error } = validateGenre(req.body);

    if (error) return res.status(400).json({ error: error.details[0].message });

    const genre = await Genre.findById(req.params.id).select('-__v');

    if (!genre) {
      return res
        .status(404)
        .json({ message: `Genre with id: ${req.params.id} doesn't exist` });
    }

    genre.name = req.body.name;
    genre.save();
    return res.json(genre);
  })
);

/**
 * delete a genre
 */
router.delete(
  '/:id',
  [auth, admin, validateObjectId],
  handler(async (req, res) => {
    const genre = await Genre.findByIdAndRemove(req.params.id).select('-__v');

    if (!genre) {
      return res
        .status(404)
        .json({ message: `Genre with id: ${req.params.id} doesn't exist` });
    }

    return res.status(200).json(genre);
  })
);

module.exports = router;
