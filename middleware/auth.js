const jwt = require('jsonwebtoken');
const config = require('config');
/**
 * in this module we validate if is an auth token
 */
module.exports = function(req, res, next) {
  const token = req.header('x-auth-token');

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Access denied. No token provided' });
  }

  try {
    const decode = jwt.verify(token, config.get('jwtPrivateKey'));
    req.user = decode;
    next();
  } catch (error) {
    return res.status(400).json({ message: 'Invalid token' });
  }
};
