const winston = require('winston');
const logger = require('debug')('app:ERROR');
/*
  winston has the followin levels: 
    error
    warn
    info
    verbose
    debug
    silly
  */
module.exports = function(err, req, res, next) {
  logger(err.message, err);
  winston.error(err.stack, err);
  return res.status(500).json({ error: 'Internal server error' });
};
