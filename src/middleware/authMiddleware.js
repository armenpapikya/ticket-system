/* eslint-disable no-undef */
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Մուտքը մերժված է. Արտահասանելի գլուխը բացակայում է." });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Մուտքը մերժված է. Սխալ տոմսի ձևաչափ." });
    }

    const token = authHeader.split(" ")[1];

    if (process.env.NODE_ENV !== 'production') {
      console.log("🔑 Տոմսի վերլուծություն:", token);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    if (process.env.NODE_ENV !== 'production') {
      console.log("✅ Տոմսը հաջողությամբ վերլուծվեց:", decoded);
    }

    next();
  } catch (err) {
    console.error("❌ Տոմսի վերլուծության սխալ:", err.message);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Տոմսի ժամկետը ավարտվել է։" });
    }

    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: "Սխալ տոմս։" });
    }

    return res.status(500).json({ message: "Սխալ սարքման ժամանակ." });
  }
};

export default authMiddleware;
