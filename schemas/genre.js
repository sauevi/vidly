const mongoose = require('mongoose');
const Joi = require('joi');

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 10
  },
  createdOn: {
    type: Date,
    default: Date.now
  }
});

/**
 * validate genre
 */
function validateGenre(genre) {
  const genreSchema = Joi.object().keys({
    name: Joi.string()
      .min(5)
      .max(10)
      .required()
  });

  return Joi.validate(genre, genreSchema);
}

exports.Genre = Genre = mongoose.model('genre', genreSchema);
exports.validateGenre = validateGenre;
exports.genreSchema = genreSchema;
