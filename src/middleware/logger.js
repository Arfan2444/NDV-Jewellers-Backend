const morgan = require('morgan');

function logger() {
  const format = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
  return morgan(format);
}

module.exports = logger;

