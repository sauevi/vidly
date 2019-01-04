const mongoose = require('mongoose');
const winston = require('winston');
// connect to mongo
module.exports = function(host) {
  mongoose
    .set('useFindAndModify', false)
    .connect(
      host,
      { useNewUrlParser: true, useCreateIndex: true }
    )
    .then(() => winston.info(`Connected to ${host}...`));
};
