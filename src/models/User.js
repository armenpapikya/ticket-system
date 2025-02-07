/* eslint-disable no-undef */
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import connectDB from '../config/db.js';

const db = connectDB();

export const createUser = async (username, email, password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    console.log(`Executing query: ${query}`);
    const [result] = await db.query(query, [username, email, hashedPassword]);
    console.log('User created:', result);
    return result;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const getUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
      if (err) {
        console.error('Error fetching user:', err);
        return reject(err);
      }
      console.log('User fetch result:', results);
      resolve(results[0]);
    });
  });
};

export const generateJWT = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};
