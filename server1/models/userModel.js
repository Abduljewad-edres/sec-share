import db from '../config/db.js';
import bcrypt from 'bcrypt';

export const createUser = async (email, password, name = null) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await db.execute(
    'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
    [email, hashedPassword, name]
  );
  return result.insertId;
};

export const findUserByEmail = async (email) => {
  const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

export const findUserById = async (id) => {
  const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
};

export const updateUserProfile = async (id, { name, avatar }) => {
  await db.execute(
    'UPDATE users SET name = ?, avatar = ? WHERE id = ?',
    [name, avatar, id]
  );
};
