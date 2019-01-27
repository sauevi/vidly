const mongoose = require('mongoose');
const Joi = require('joi');
const moment = require('moment');

const rentalSchema = new mongoose.Schema({
  customer: {
    type: new mongoose.Schema({
      name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
      },
      phone: {
        type: String,
        required: true,
        match: /^\d+$/,
        minlength: 10,
        maxlength: 50
      },
      isGold: {
        type: Boolean,
        default: false
      }
    }),
    required: true
  },
  movie: {
    type: new mongoose.Schema({
      title: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 255
      },
      dailyRentalRate: {
        type: Number,
        required: true,
        min: 0,
        max: 255
      }
    }),
    required: true
  },
  dateOut: {
    type: Date,
    required: true,
    default: Date.now
  },
  dateReturned: {
    type: Date
  },
  rentalFee: {
    type: Number,
    min: 0
  }
});

rentalSchema.statics.lookup = function(customerId, movieId) {
  //search for a rental
  return this.findOne({
    'customer._id': customerId,
    'movie._id': movieId
  });
};

rentalSchema.methods.movieReturned = function() {
  this.dateReturned = new Date();

  const rentailDays = moment().diff(this.dateOut, 'days');
  this.rentalFee = rentailDays * this.movie.dailyRentalRate;
};

const Rental = mongoose.model('rental', rentalSchema);

/**
 * validate rentail
 */

function validateRentail(rental) {
  const schema = {
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required()
  };

  return Joi.validate(rental, schema);
}

exports.Rental = Rental;
exports.validate = validateRentail;
