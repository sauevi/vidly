const config = require('config');
const express = require('express');
const Joi = require('joi');
const winston = require('winston');
Joi.objectId = require('joi-objectid')(Joi);
// set port
const port = process.env.PORT || 3000;
// init app
const app = express();
// load modules
require('./startup/logger')();
require('./startup/routes')(app);
require('./startup/db')(config.get('db'));
require('./startup/config')(config);
require('./startup/prod')(app);

const server = app.listen(port, () =>
  winston.info(`App started on port: ${port}`)
);

module.exports = server;
