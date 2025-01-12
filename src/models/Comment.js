import connectDB from '../config/db.js';

const db = connectDB();

export const createComment = (ticketId, userId, commentText) => {
  return new Promise((resolve, reject) => {
    db.query(
      'INSERT INTO comments (ticket_id, user_id, comment) VALUES (?, ?, ?)',
      [ticketId, userId, commentText],
      (err, result) => {
        if (err) reject(err);
        resolve(result);
      }
    );
  });
};

export const getCommentsByTicketId = (ticketId) => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT * FROM comments WHERE ticket_id = ?',
      [ticketId],
      (err, results) => {
        if (err) reject(err);
        resolve(results);
      }
    );
  });
};
