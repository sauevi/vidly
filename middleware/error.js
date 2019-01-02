const winston = require('winston');
const debug = require('debug')('app:ERROR');
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
  debug(err);
  winston.error(err.message, err);
  return res.status(500).json({ error: 'Internal server error' });
};
