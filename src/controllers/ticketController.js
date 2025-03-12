import { validationResult } from 'express-validator';
import db from './db';

const checkAdminRole = async (userId) => {
  try {
    const [user] = await db.query('SELECT role FROM users WHERE id = ?', [userId]);
    return user.length > 0 && user[0]?.role === 'admin';
  } catch (error) {
    console.error('Սխալ ստուգել օգտագործողի դերը:', error);
    throw new Error('Server error');
  }
};

export const getTickets = async (req, res) => {
  const userId = req.user.id;

  try {
    const [tickets] = await db.query('SELECT * FROM tickets WHERE user_id = ?', [userId]);
    if (tickets.length === 0) {
      return res.status(404).json({ message: 'Տոմսեր չեն գտնվել' });
    }
    res.json(tickets);
  } catch (error) {
    console.error('Տոմսեր ստուգելու ժամանակ սխալ:', error);
    res.status(500).json({ message: 'Տոմսեր ստուգելու ժամանակ սխալ' });
  }
};

export const createTicket = async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user.id;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const [result] = await db.query('INSERT INTO tickets (user_id, title, description) VALUES (?, ?, ?)', [userId, title, description]);
    res.status(201).json({ id: result.insertId, title, description });
  } catch (error) {
    console.error('Տոմս ստեղծելիս սխալ:', error);
    res.status(500).json({ message: 'Տոմս ստեղծելու ժամանակ սխալ' });
  }
};

export const updateTicketStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.id;

  try {
    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({ message: 'Անհաջող: Միայն ադմինները կարող են թարմացնել տոմսի կարգավիճակը' });
    }

    const [result] = await db.query('UPDATE tickets SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Տոմսը չի գտնվել' });
    }
    res.status(200).json({ message: 'Տոմսի կարգավիճակը թարմացված է հաջողությամբ' });
  } catch (error) {
    console.error('Տոմսի կարգավիճակը թարմացնելու ժամանակ սխալ:', error);
    res.status(500).json({ message: 'Տոմսի կարգավիճակը թարմացնելու ժամանակ սխալ' });
  }
};

export const closeTicket = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({ message: 'Անհաջող: Միայն ադմինները կարող են փակել տոմսերը' });
    }

    const [result] = await db.query('UPDATE tickets SET status = "closed" WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Տոմսը չի գտնվել' });
    }
    res.status(200).json({ message: 'Տոմսը փակվել է' });
  } catch (error) {
    console.error('Տոմսը փակելու ժամանակ սխալ:', error);
    res.status(500).json({ message: 'Տոմսը փակելու ժամանակ սխալ' });
  }
};

export const deleteTicket = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({ message: 'Անհաջող: Միայն ադմինները կարող են ջնջել տոմսերը' });
    }

    const [result] = await db.query('DELETE FROM tickets WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Տոմսը չի գտնվել' });
    }
    res.status(200).json({ message: 'Տոմսը ջնջվել է' });
  } catch (error) {
    console.error('Տոմսը ջնջելու ժամանակ սխալ:', error);
    res.status(500).json({ message: 'Տոմսը ջնջելու ժամանակ սխալ' });
  }
};
