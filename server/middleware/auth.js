const requireAuth = (req, res, next) => {

  // Check if a session exists with a userId
  if (!req.session || !req.session.userId) {
    // No session = not logged in = block them
    return res.status(401).json({ error: 'You must be logged in' });
  }

  // Session exists - attach user info to req so routes can use it
  // This means any route using this middleware can access req.user
  req.user = {
    id: req.session.userId,
    username: req.session.username
  };

  // Call next() to pass control to the actual route handler
  next();
};

module.exports = requireAuth;
