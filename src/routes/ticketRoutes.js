import express from "express";
import db from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { body, validationResult } from "express-validator";

const checkAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [user] = await db.query("SELECT isAdmin FROM users WHERE id = ?", [userId]);

    if (user.length === 0 || !user[0].isAdmin) {
      return res.status(403).json({ message: "You do not have permission to perform this action." });
    }

    next();
  } catch (error) {
    console.error("Error checking admin:", error);
    res.status(500).json({ message: "Server error while checking admin status" });
  }
};

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const [tickets] = await db.query(`SELECT tickets.id, tickets.user_id, tickets.title, tickets.description, tickets.status, tickets.created_at, users.username AS createdBy
      FROM tickets
      LEFT JOIN users ON tickets.user_id = users.id
      WHERE tickets.user_id = ?`, [userId]);

    if (tickets.length === 0) {
      return res.status(404).json({ message: "No tickets found" });
    }

    console.log("Fetched tickets:", tickets);
    res.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error.message);
    res.status(500).json({ message: "Server error while fetching tickets" });
  }
});

router.post(
  "/",
  [
    body("title")
      .notEmpty().withMessage("Title is required")
      .isLength({ min: 3 }).withMessage("Title must be at least 3 characters")
      .trim(),
    body("description")
      .notEmpty().withMessage("Description is required")
      .isLength({ min: 5 }).withMessage("Description must be at least 5 characters")
      .trim(),
  ],
  authMiddleware,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description } = req.body;
    const userId = req.user.id;

    try {
      const [result] = await db.query(
        "INSERT INTO tickets (user_id, title, description, status, created_at) VALUES (?, ?, ?, 'open', NOW())",
        [userId, title, description]
      );

      if (result.affectedRows === 1) {
        return res.status(201).json({
          id: result.insertId,
          user_id: userId,
          title,
          description,
          status: 'open',
        });
      } else {
        return res.status(500).json({ message: "Failed to create ticket" });
      }
    } catch (error) {
      console.error("Error creating ticket:", error.message);
      res.status(500).json({ message: "Server error while creating ticket" });
    }
  }
);

router.put("/:id", authMiddleware, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const [ticket] = await db.query("SELECT * FROM tickets WHERE id = ?", [id]);
    if (ticket.length === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    await db.query("UPDATE tickets SET status = ? WHERE id = ?", [status, id]);
    res.json({ message: "Ticket status updated" });
  } catch (error) {
    console.error("Error updating ticket status:", error.message);
    res.status(500).json({ message: "Server error while updating ticket status" });
  }
});

router.delete("/:id", authMiddleware, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [ticket] = await db.query("SELECT * FROM tickets WHERE id = ?", [id]);
    if (ticket.length === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    await db.query("DELETE FROM tickets WHERE id = ?", [id]);
    res.json({ message: "Ticket deleted" });
  } catch (error) {
    console.error("Error deleting ticket:", error.message);
    res.status(500).json({ message: "Server error while deleting ticket" });
  }
});

router.get("/user", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const [user] = await db.query("SELECT id, username, email FROM users WHERE id = ?", [userId]);

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user[0]);
  } catch (error) {
    console.error("Error fetching user:", error.message);
    res.status(500).json({ message: "Server error while fetching user data" });
  }
});

export default router;
