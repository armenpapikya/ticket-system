import connectDB from '../config/db.js';

const db = connectDB();

export const createTicket = (userId, title, description) => {
  return new Promise((resolve, reject) => {
    db.query(
      'INSERT INTO tickets (user_id, title, description) VALUES (?, ?, ?)',
      [userId, title, description],
      (err, result) => {
        if (err) reject(err);
        resolve(result);
      }
    );
  });
};

export const getTicketsByUserId = (userId) => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT * FROM tickets WHERE user_id = ?',
      [userId],
      (err, results) => {
        if (err) reject(err);
        resolve(results);
      }
    );
  });
};

export const updateTicketStatus = (ticketId, status) => {
  return new Promise((resolve, reject) => {
    db.query(
      'UPDATE tickets SET status = ? WHERE id = ?',
      [status, ticketId],
      (err, result) => {
        if (err) reject(err);
        resolve(result);
      }
    );
  });
};
