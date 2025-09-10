/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './config/db.js';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(cookieParser());
app.use(express.json());
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 200,
  message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter);

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authentication token required' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

app.get('/api/user/me', authenticate, (req, res) => {
  res.json(req.user);
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const users = await db.query(
      'SELECT id, email, username, password, role FROM users WHERE email = ?',
      [email]
    );
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict'
    });
    res.json({
      message: 'Login successful',
      accessToken,
      user: { id: user.id, email: user.email, username: user.username, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.patch('/api/tickets/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await db.query('UPDATE tickets SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json({ message: 'Ticket updated successfully' });
  } catch (err) {
    console.error('Error updating ticket:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/refresh', async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'Refresh token required' });
  try {
    const decoded = jwt.verify(token, process.env.REFRESH_SECRET);
    const users = await db.query('SELECT id, email, username, role FROM users WHERE id = ?', [decoded.id]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });
    const user = users[0];
    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ accessToken: newAccessToken, user });
  } catch (err) {
    console.error('Refresh token error:', err);
    res.status(403).json({ message: 'Invalid refresh token' });
  }
});

app.get('/api/users/profile', authenticate, async (req, res) => {
  try {
    res.json({
      id: req.user.id,
      email: req.user.email,
      username: req.user.username,
      role: req.user.role
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/tickets', authenticate, async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM tickets WHERE 1 = 1';
    const queryParams = [];
    if (status && status !== 'all') {
      query += ' AND status = ?';
      queryParams.push(status);
    }
    const tickets = await db.query(query, queryParams);

    // Ստանում ենք բոլոր user_id-ները
    const userIds = [...new Set(tickets.map(t => t.user_id))];
    let users = [];
    if (userIds.length > 0) {
      const placeholders = userIds.map(() => '?').join(',');
      users = await db.query(
        `SELECT id, username FROM users WHERE id IN (${placeholders})`,
        userIds
      );
    }

    res.json({ tickets, users });
  } catch (err) {
    console.error('Error fetching tickets:', err);
    res.status(500).json({ message: 'Error fetching tickets' });
  }
});

app.post('/api/tickets', authenticate, async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }
    const result = await db.query(
      'INSERT INTO tickets (user_id, title, description) VALUES (?, ?, ?)',
      [userId, title, description]
    );
    res.status(201).json({ id: result.insertId, title, description, user_id: userId, status: 'open' });
  } catch (err) {
    console.error('Error creating ticket:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/tickets', authenticate, async (req, res) => {
  try {
    const { ticketIds } = req.body;
    if (!Array.isArray(ticketIds) || ticketIds.length === 0) {
      return res.status(400).json({ message: 'No ticket IDs provided' });
    }
    const placeholders = ticketIds.map(() => '?').join(',');
    await db.query(
      `DELETE FROM tickets WHERE id IN (${placeholders})`,
      ticketIds
    );
    res.json({ message: 'Tickets deleted successfully' });
  } catch (err) {
    console.error('Error deleting tickets:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    // Ստուգում ենք, որ email-ը դեռ չկա
    const existing = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
      [email, username, hashedPassword]
    );
    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
