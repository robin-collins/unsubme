// /routes/middleware/authMiddleware.js
const User = require('../../models/User');

const isAuthenticated = async (req, res, next) => {
  if (req.session && req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      if (!user) {
        return res.status(401).send('User not found');
      }
      req.user = user; // Populate req.user with the authenticated user
      return next(); // User is authenticated, proceed to the next middleware/route handler
    } catch (error) {
      console.error('Error fetching user:', error);
      return res.status(500).send('Internal Server Error');
    }
  } else {
    return res.status(401).send('You are not authenticated'); // User is not authenticated
  }
};

module.exports = {
  isAuthenticated
};
