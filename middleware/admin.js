module.exports = function(req, res, next) {
  // 401 Unauthorized -> not valid Json web token
  // 403 Forbidden -> Can't access
  if (!req.user.isAdmin)
    return res.status(403).json({ message: 'Access denied.' });

  next();
};
