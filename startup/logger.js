const winston = require('winston');

module.exports = function() {
  /*
   * get uncaught exceptions and log it
   */
  winston.exceptions.handle(
    new winston.transports.Console({ colorize: true, prettyPrint: true }),
    new winston.transports.File({ filename: 'logs/uncaughtException.log' })
  );
  winston.exitOnError = true;
  /*
   * get unhandle exceptions and log it
   */
  process.on('unhandledRejection', ex => {
    throw ex;
  });
  /*
   * create a winston logger
   */
  winston.add(
    new winston.transports.Console({ colorize: true, prettyPrint: true }),
    new winston.transports.File({
      filename: 'logs/vidly.log'
    })
  );
};
