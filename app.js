const express = require('express');
const genres = require('./routes/genres');
const customers = require('./routes/customers');
const movies = require('./routes/movies');
const rental = require('./routes/rentals');
const users = require('./routes/users');
const auth = require('./routes/auth');
const error = require('./middleware/error');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const debug = require('debug')('app:startup');
const mongoose = require('mongoose');
const config = require('config');
const Joi = require('joi');
const winston = require('winston');
Joi.objectId = require('joi-objectid')(Joi);

winston.add(new winston.transports.File({ filename: 'vidly.log' }));

if (!config.get('jwtPrivateKey')) {
  debug('FATAL ERROR: jwtPrivateKey is not defined.');
  process.exit(1);
}
// set port port
const port = config.get('port') || 3000;
// init app
const app = express();
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
// connect to mongo
mongoose
  .set('useFindAndModify', false)
  .connect(
    config.get('db.host'),
    { useNewUrlParser: true, useCreateIndex: true }
  )
  .then(() => {
    app.listen(port, () =>
      debug(`Successfull Conected to MongoDB, App started on port: ${port}`)
    );
  })
  .catch(err => debug('Could not connect to MongoDb..', err));
