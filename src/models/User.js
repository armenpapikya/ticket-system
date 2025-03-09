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
    
    const [result] = await db.promise().query(query, [username, email, hashedPassword]);
    console.log('User created:', result);
    return result;
  } catch (error) {
    console.error('Error creating user:', error.message || error);
    throw new Error('Սխալ է տեղի ունեցել օգտատեր ստեղծելիս: Փորձեք ևս մեկ անգամ');
  }
};

export const getUserByEmail = async (email) => {
  try {
    const [results] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (results.length === 0) {
      return null;
    }
    
    console.log('User fetch result:', results);
    return results[0];
  } catch (error) {
    console.error('Error fetching user:', error.message || error);
    throw new Error('Սխալ է տեղի ունեցել օգտատեր որոնելիս: Փորձեք ևս մեկ անգամ');
  }
};

export const generateJWT = (userId, role) => {
  try {
    const payload = { userId, role };
    const options = { expiresIn: '1h' };
    const token = jwt.sign(payload, process.env.JWT_SECRET, options);
    console.log('Generated JWT:', token);
    return token;
  } catch (error) {
    console.error('Error generating JWT:', error.message || error);
    throw new Error('Սխալ է տեղի ունեցել JWT ստեղծելիս');
  }
};
