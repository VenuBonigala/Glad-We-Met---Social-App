import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// This is our "security guard" middleware
const protect = async (req, res, next) => {
  let token;

  // 1. Check if the request has a token in the 'Authorization' header
  // Tokens are usually sent as "Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 2. Get the token part from the header
      token = req.headers.authorization.split(' ')[1];

      // 3. Verify the token using our JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Find the user from the token's ID and attach them to the request
      // We exclude the password when fetching the user
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // 5. Call 'next()' to proceed to the actual route handler
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // 6. If no token is found at all
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export { protect };