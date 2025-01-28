
exports.authenticate = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token || token !== 'Bearer my-static-token') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};
