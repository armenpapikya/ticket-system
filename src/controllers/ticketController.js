/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import '../models/Ticket.js';

export const getTickets = async (req, res) => {
    try {
        const [tickets] = await Ticket.getByUserId(req.user.id);
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
};

export const createTicket = async (req, res) => {
    const { title, description } = req.body;
    try {
        const [result] = await Ticket.create({ title, description, userId: req.user.id });
        res.status(201).json({ id: result.insertId, title, description });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create ticket' });
    }
};

export const updateTicketStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin rights required' });
    }

    try {
        await Ticket.updateStatus(id, status);
        res.status(200).json({ message: 'Ticket status updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update ticket status' });
    }
};
