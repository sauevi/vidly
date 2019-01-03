const genres = require('../routes/genres');
const customers = require('../routes/customers');
const movies = require('../routes/movies');
const rental = require('../routes/rentals');
const users = require('../routes/users');
const auth = require('../routes/auth');
const error = require('../middleware/error');
const bodyParser = require('body-parser');
const helmet = require('helmet');

module.exports = function(app) {
  // protect
  app.use(helmet());
  // body parser moddleware
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  // routes
  app.use('/api/genres', genres);
  app.use('/api/customers', customers);
  app.use('/api/movies', movies);
  app.use('/api/rentals', rental);
  app.use('/api/users', users);
  app.use('/api/auth', auth);
  // manage errors
  app.use(error);
};
