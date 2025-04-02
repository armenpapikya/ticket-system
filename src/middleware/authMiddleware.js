/* eslint-disable no-undef */
import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables');
    return res.status(500).json({ message: 'Internal server error' });
  }

  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    console.log('Decoded user:', req.user);

    next();
  } catch (error) {
    console.error('Error verifying token:', error.message);

    const errorMessages = {
      TokenExpiredError: 'Token expired, please log in again or refresh your token',
      JsonWebTokenError: 'Invalid token',
    };

    return res.status(401).json({ message: errorMessages[error.name] || 'Authentication error' });
  }
};

export default authMiddleware;
