const winston = require('winston');
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
  winston.error(err.stack, err);
  return res.status(500).json({ error: 'Internal server error' });
};
