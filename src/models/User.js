import express from 'express';
import db from '../config/db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    console.log("User from authMiddleware:", req.user);

    const userId = req.user.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in the request' });
    }

    const [users] = await db.query(
      'SELECT id, username, email, role FROM users WHERE id = ?',
      [userId]
    );

    console.log("Fetched user from DB:", users);

    if (!users.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    const [tickets] = await db.query(
      'SELECT id, title, status, created_at FROM tickets WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [userId]
    );

    console.log("Fetched tickets:", tickets);

    res.json({ user, tickets });
  } catch (error) {
    console.error('🔥 Error fetching profile:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

export default router;
