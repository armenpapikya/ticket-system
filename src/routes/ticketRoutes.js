import express from "express";
import db from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const [tickets] = await db.query("SELECT * FROM tickets WHERE user_id = ?", [userId]);

    if (tickets.length === 0) {
      return res.status(404).json({ message: "No tickets found" });
    }

    console.log("Fetched tickets:", tickets);
    res.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ message: "Server error" });
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
      router.get("/user", authMiddleware, async (req, res) => {
        try {
          const userId = req.user.id;
          const [user] = await db.query("SELECT id, username, email FROM users WHERE id = ?", [userId]);
      
          if (user.length === 0) {
            return res.status(404).json({ message: "User not found" });
          }
      
          res.json(user[0]);
        } catch (error) {
          console.error("Error fetching user:", error);
          res.status(500).json({ message: "Server error" });
        }
      });
      
      console.log("Database insert result:", result);

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
      console.error("Error creating ticket:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
