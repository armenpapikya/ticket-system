import express from 'express';
import { getTickets, createTicket, updateTicketStatus } from '../controllers/ticketController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateJWT, getTickets);
router.post('/', authenticateJWT, createTicket);
router.put('/:id/status', authenticateJWT, updateTicketStatus);

export default router;
