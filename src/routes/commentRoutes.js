/* eslint-disable no-unused-vars */
import express from 'express';
import { createComment, getCommentsByTicketId } from '../models/Comment.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { ticketId, userId, commentText } = req.body;
  try {
    const comment = await createComment(ticketId, userId, commentText);
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: 'Մեկնաբանություն ստեղծելու ժամանակ սխալ է տեղի ունեցել' });
  }
});

router.get('/:ticketId', async (req, res) => {
  const { ticketId } = req.params;
  try {
    const comments = await getCommentsByTicketId(ticketId);
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Մեկնաբանությունները բեռնելու ժամանակ սխալ է տեղի ունեցել' });
  }
});

export default router;
