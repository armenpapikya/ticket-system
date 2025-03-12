/* eslint-disable no-undef */
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Unauthorized: No token found." });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Unauthorized: Invalid token format." });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    console.error("Error verifying token:", err.message);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired." });
    }

    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: "Invalid token." });
    }

    return res.status(500).json({ message: "Server error." });
  }
};

export default authMiddleware;
