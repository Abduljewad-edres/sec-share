import db from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// POST /api/admin/login
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.execute(
      "SELECT * FROM users WHERE email = ? AND role = 'admin'",
      [email]
    );
    const admin = rows[0];
    if (!admin || !await bcrypt.compare(password, admin.password)) {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }
    const token = jwt.sign(
      { id: admin.id, role: 'admin' },
      process.env.JWT_SECRET || 'secret'
    );
    res.json({ token, email: admin.email, role: 'admin' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT u.id, u.email, u.role, u.created_at,
              COUNT(f.id) as file_count,
              COALESCE(SUM(f.size),0) as total_size
       FROM users u
       LEFT JOIN files f ON f.user_id = u.id
       WHERE u.role = 'user'
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/files
export const getAllFiles = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT f.id, f.name, f.size, f.created_at, u.email as owner_email
       FROM files f
       JOIN users u ON f.user_id = u.id
       ORDER BY f.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    await db.execute('DELETE FROM users WHERE id = ? AND role = "user"', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
