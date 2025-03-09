/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import bcrypt from "bcryptjs";
import { validationResult, check } from "express-validator";
import jwt from "jsonwebtoken";
import db from "./db.js";

const emailValidation = check('email').isEmail().withMessage('Խնդրում ենք տրամադրել վավեր էլ.փոստ');

const passwordValidation = check('password')
  .isLength({ min: 8 }).withMessage('Գաղտնաբառը պետք է լինի առնվազն 8 նիշ')
  .matches(/[A-Z]/).withMessage('Գաղտնաբառը պետք է պարունակի առնվազն մեկ մեծատառ')
  .matches(/[a-z]/).withMessage('Գաղտնաբառը պետք է պարունակի առնվազն մեկ փոքրատառ')
  .matches(/\d/).withMessage('Գաղտնաբառը պետք է պարունակի առնվազն մեկ թիվ')
  .matches(/[\W_]/).withMessage('Գաղտնաբառը պետք է պարունակի առնվազն մեկ հատուկ նշան');

export const register = async (req, res) => {
  try {
    let { email, password, username } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const [existingUser] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Այս էլ.փոստը արդեն գրանցված է" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await db.query(
      "INSERT INTO users (email, password, username, role) VALUES (?, ?, ?, ?)",
      [email, hashedPassword, username, "user"]
    );

    return res.status(201).json({ message: "Օգտատերը հաջողությամբ գրանցվեց" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Սերվերի սխալ" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (!users || users.length === 0) {
      return res.status(400).json({ message: "Սխալ տվյալներ" });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Սխալ տվյալներ" });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    return res.status(200).json({
      message: "Մուտք գործել է հաջողությամբ",
      user: { id: user.id, email: user.email, username: user.username, role: user.role },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Սերվերի սխալ" });
  }
};
