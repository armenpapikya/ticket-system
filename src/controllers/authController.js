/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import '../models/User.js';

export const register = async (req, res) => {
    const { username, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        await User.create({ username, password: hashedPassword, role });
        res.status(200).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to register user' });
    }
};

export const login = async (req, res) => {
    const { username, password } = req.body;
    const [user] = await User.findByUsername(username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET);
    res.json({ token });
};
