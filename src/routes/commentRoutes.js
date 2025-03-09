import express from 'express';
import { body, validationResult } from 'express-validator';
import { createComment, getCommentsByTicketId } from '../models/Comment.js';

const router = express.Router();

router.post(
  '/',
  [
    body('ticketId')
      .isInt().withMessage('Տոմսի ID-ն պետք է լինի ամբողջ թիվ')
      .toInt(),  
    body('userId')
      .isInt().withMessage('Օգտագործողի ID-ն պետք է լինի ամբողջ թիվ')
      .toInt(),  
    body('commentText')
      .notEmpty().withMessage('Մեկնաբանությունը պարտադիր է')
      .isLength({ min: 5 }).withMessage('Մեկնաբանությունը պետք է ունենա առնվազն 5 նիշ'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  async (req, res) => {
    const { ticketId, userId, commentText } = req.body;
    try {
      const comment = await createComment(ticketId, userId, commentText);
      res.status(201).json(comment);
    } catch (err) {
      console.error("Սխալ ստեղծելիս մեկնաբանություն:", err);
      res.status(500).json({ error: 'Սխալ եղավ մեկնաբանություն ստեղծելիս' });
    }
  }
);

router.get('/:ticketId', async (req, res) => {
  const { ticketId } = req.params;
  try {
    const comments = await getCommentsByTicketId(ticketId);
    if (comments.length === 0) {
      return res.status(404).json({ message: 'Այս տոմսի համար մեկնաբանություններ չեն գտնվել' });
    }
    res.status(200).json(comments);
  } catch (err) {
    console.error("Սխալ եղավ մեկնաբանություններ ստանալիս:", err);
    res.status(500).json({ error: 'Սխալ եղավ մեկնաբանություններ ստանալիս' });
  }
});

export default router;
