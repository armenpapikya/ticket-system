import connectDB from '../config/db.js';

const db = connectDB();

export const createComment = async (ticketId, userId, commentText) => {
  try {
    const [ticket] = await db.query('SELECT * FROM tickets WHERE id = ?', [ticketId]);
    if (!ticket.length) {
      throw new Error("Տոմսը չի գտնվել");
    }

    const [result] = await db.query(
      'INSERT INTO comments (ticket_id, user_id, comment) VALUES (?, ?, ?)',
      [ticketId, userId, commentText]
    );

    return result;
  } catch (err) {
    console.error("Սխալ մեկնաբանություն ստեղծելիս:", err.message || err);
    throw new Error("Սխալ է տեղի ունեցել մեկնաբանություն ստեղծելիս");
  }
};

export const getCommentsByTicketId = async (ticketId) => {
  try {
    const [results] = await db.query(
      'SELECT * FROM comments WHERE ticket_id = ?',
      [ticketId]
    );
    
    if (results.length === 0) {
      throw new Error("Այս տոմսի համար մեկնաբանություններ չեն գտնվել");
    }

    return results;
  } catch (err) {
    console.error("Սխալ մեկնաբանություններ ստանալու ժամանակ:", err.message || err);
    throw new Error("Սխալ է տեղի ունեցել մեկնաբանություններ ստանալիս");
  }
};
