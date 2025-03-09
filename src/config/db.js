/* eslint-disable no-undef */
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function query(query, values = []) {
  try {
    const [results] = await db.execute(query, values);
    return results;
  } catch (error) {
    console.error('Database query failed:', error.message);
    throw new Error('Database query failed');
  }
}

export default { query };
