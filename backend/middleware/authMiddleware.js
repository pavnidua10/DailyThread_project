import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const protect = async (req, res, next) => {
  try {
    
    const token = req.cookies?.jwt;

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }


    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

export default protect;


