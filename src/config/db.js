/* eslint-disable no-undef */
import mysql from 'mysql2';

const connectDB = () => {
  const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'ticket_system',
  });

  db.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      process.exit(1);
    }
    console.log('Connected to MySQL database');
  });

  return db;
};

export default connectDB;
