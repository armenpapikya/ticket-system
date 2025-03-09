/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import express from "express";
import mysql from "mysql2";
import cors from "cors";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import winston from "winston";
import speakeasy from "speakeasy";
import redis from "redis";
import authMiddleware from "./middleware/authMiddleware.js";
import ticketRoutes from "./routes/ticketRoutes.js";

dotenv.config();

if (!process.env.DB_HOST ||
  !process.env.DB_USER ||
  !process.env.DB_PASSWORD ||
  !process.env.DB_NAME ||
  !process.env.JWT_SECRET
  || !process.env.REFRESH_SECRET) {
  console.error("❌ Missing required environment variables!");
  process.exit(1);
}

const redisClient = redis.createClient();

const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  ],
});

const app = express();

const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.',
});
app.use(limiter);

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

db.promise().query("SELECT 1")
  .then(() => console.log("✅ Connected to MySQL"))
  .catch((err) => {
    logger.error("❌ Database connection error:", err);
    process.exit(1);
  });

app.use("/api/tickets", ticketRoutes);

app.get("/api/user", (req, res) => {
  const user = { id: 1, name: "Admin", role: "admin" };
  res.json(user);
});

app.post("/api/auth/login", async (req, res) => {
  console.log("🔹 Received login request:", req.body);

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Please provide email and password." });
  }

  try {
    const [results] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);
    if (results.length === 0) return res.status(400).json({ message: "User not found." });

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: "Invalid password." });

    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.status(200).json({
      message: "Login successful!",
      user: { id: user.id, email: user.email, username: user.username, role: user.role },
      token: accessToken,
    });
  } catch (error) {
    logger.error("❌ Error processing login:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
});

app.post("/api/auth/register", async (req, res) => {
  console.log("🔹 Received register request:", req.body);

  const { email, password, username } = req.body;
  if (!email || !password || !username) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters long." });
  }

  try {
    const [existingUsers] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUsers.length > 0) return res.status(400).json({ message: "This email is already registered." });

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.promise().query("INSERT INTO users (email, password, username, role) VALUES (?, ?, ?, ?)",
      [email, hashedPassword, username, "user"]);

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    logger.error("❌ Registration error:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
});

app.post("/api/auth/verify-otp", (req, res) => {
  const { otp, userId } = req.body;
  const secret = process.env.SECRET;

  const isVerified = speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token: otp,
  });

  if (!isVerified) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  res.status(200).json({ message: "OTP Verified Successfully" });
});

app.post("/api/auth/refresh-token", (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: "Unauthorized. No refresh token." });

  jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid refresh token." });

    const newAccessToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token: newAccessToken });
  });
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Logged out successfully!" });
});

app.get("/api/users/profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const [results] = await db.promise().query("SELECT id, username, email, role FROM users WHERE id = ?",
      [userId]);
    if (results.length === 0) return res.status(404).json({ message: "User not found." });

    res.status(200).json(results[0]);
  } catch (error) {
    logger.error("❌ Error fetching profile:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
