import bcrypt from 'bcrypt';
import { createUser, getUserByEmail, generateJWT } from '../models/User.js';

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Այս էլեկտրոնային հասցեն արդեն գրանցված է' });
    }

    // eslint-disable-next-line no-unused-vars
    const result = await createUser(username, email, password);
    res.status(201).json({ message: 'Օգտագործողը հաջողությամբ ստեղծվել է' });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Սխալ է տեղի ունեցել' });
  }
};

export const login = async (req, res) => {
  console.log('Login request body:', req.body);

  const { email, password } = req.body;

  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'Հասցեն սխալ է' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Գաղտնաբառը սխալ է' });
    }

    const token = generateJWT(user.id, user.role);
    res.status(200).json({ message: 'Մուտք գործած եք', token, username: user.username, role: user.role });
  } catch (err) {
    console.error('Error logging in user:', err.stack || err);
    res.status(500).json({ error: 'Սխալ է տեղի ունեցել' });
  }
};
