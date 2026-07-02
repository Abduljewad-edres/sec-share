import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { createUser, findUserByEmail, findUserById, updateUserProfile } from '../models/userModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const avatarDir = path.join(__dirname, '..', 'uploads', 'avatars');
if (!fs.existsSync(avatarDir)) fs.mkdirSync(avatarDir, { recursive: true });

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarDir),
  filename:    (req, file, cb) => cb(null, `avatar-${Date.now()}${path.extname(file.originalname)}`),
});

export const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'));
  },
});

export const register = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const existing = await findUserByEmail(email);
    if (existing) return res.status(400).json({ message: 'User exists' });
    const userId = await createUser(email, password, name);
    const token  = jwt.sign({ id: userId, role: 'user' }, process.env.JWT_SECRET || 'secret');
    res.json({ token, name, role: 'user' });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await findUserByEmail(email);
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret');
    res.json({ token, role: user.role, name: user.name, avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Not found' });
    res.json({ id: user.id, email: user.email, name: user.name, avatar: user.avatar, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user   = await findUserById(req.user.id);
    const name   = req.body.name   ?? user.name;
    const avatar = req.file
      ? `/uploads/avatars/${req.file.filename}`
      : (req.body.avatar ?? user.avatar);
    await updateUserProfile(req.user.id, { name, avatar });
    res.json({ name, avatar });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};