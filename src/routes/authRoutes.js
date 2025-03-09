import express from 'express';
import { register, login, updateAdminPassword } from '../controllers/authController.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

router.put('/admin/update-password', updateAdminPassword);

router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .withMessage('Մուտքագրված էլ-փոստը սխալ է'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Ցանկացած գաղտնաբառը պետք է պարունակի առնվազն 6 նիշ'),
    body('username')
      .notEmpty()
      .withMessage('Անվանումը պարտադիր է')
      .isLength({ min: 3 })
      .withMessage('Անվանումը պետք է լինի առնվազն 3 նիշ'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  register
);

router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Մուտքագրված էլ-փոստը սխալ է'),
    body('password')
      .notEmpty()
      .withMessage('Գաղտնաբառը պարտադիր է'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  login
);

export default router;
