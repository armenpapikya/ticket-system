import connectDB from '../config/db.js';

const db = connectDB();

const validateFields = (fields) => {
  for (const [key, value] of Object.entries(fields)) {
    if (!value || value.trim() === '') {
      throw new Error(`${key} անհրաժեշտ է և չպետք է դատարկ լինի`);
    }
  }
};

export const createTicket = async (userId, title, description) => {
  try {
    validateFields({ userId, title, description });

    const [result] = await db.query(
      'INSERT INTO tickets (user_id, title, description) VALUES (?, ?, ?)',
      [userId, title, description]
    );

    return result;
  } catch (err) {
    console.error('Տոմս ստեղծելիս սխալ:', err.message || err);
    throw new Error(err.message || 'Տոմս ստեղծելու ժամանակ սխալ');
  }
};

export const getTicketsByUserId = async (userId) => {
  try {
    validateFields({ userId });

    const [results] = await db.query(
      'SELECT * FROM tickets WHERE user_id = ?',
      [userId]
    );

    return results;
  } catch (err) {
    console.error('Տոմսեր ստուգելու ժամանակ սխալ:', err.message || err);
    throw new Error(err.message || 'Տոմսերը ստուգելու ժամանակ սխալ');
  }
};

export const updateTicketStatus = async (Id, status) => {
  try {
    validateFields({ Id, status });

    const [result] = await db.query(
      'UPDATE tickets SET status = ? WHERE id = ?',
      [status, Id]
    );

    if (result.affectedRows === 0) {
      throw new Error('Տոմսը չի գտնվել');
    }

    return result;
  } catch (err) {
    console.error('Տոմսի կարգավիճակը թարմացնելու ժամանակ սխալ:', err.message || err);
    throw new Error(err.message || 'Տոմսի կարգավիճակը թարմացնելու ժամանակ սխալ');
  }
};
