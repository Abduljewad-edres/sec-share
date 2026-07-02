import express from 'express';
import auth from '../middleware/auth.js';
import { adminLogin, getAllUsers, getAllFiles, deleteUser } from '../controllers/adminController.js';

const router = express.Router();

// Admin-only middleware
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  next();
};

router.post('/login', adminLogin);
router.get('/users', auth, adminOnly, getAllUsers);
router.get('/files', auth, adminOnly, getAllFiles);
router.delete('/users/:id', auth, adminOnly, deleteUser);

export default router;
