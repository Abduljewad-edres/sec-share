import db from '../config/db.js';

export const createFile = async (userId, name, filePath, size) => {
  const [result] = await db.execute(
    'INSERT INTO files (user_id, name, path, size) VALUES (?, ?, ?, ?)',
    [userId, name, filePath, size]
  );
  return result.insertId;
};

export const getFilesByUser = async (userId) => {
  const [rows] = await db.execute(
    'SELECT id, name, size, created_at FROM files WHERE user_id = ?',
    [userId]
  );
  return rows;
};

export const deleteFile = async (id, userId) => {
  await db.execute('DELETE FROM files WHERE id = ? AND user_id = ?', [id, userId]);
};

export const findFileById = async (id) => {
  const [rows] = await db.execute('SELECT * FROM files WHERE id = ?', [id]);
  return rows[0];
};

// Share token helpers
export const createShareToken = async (fileId, token, expiresAt) => {
  await db.execute(
    'INSERT INTO shares (file_id, token, expires_at) VALUES (?, ?, ?)',
    [fileId, token, expiresAt || null]
  );
};

export const findShareByToken = async (token) => {
  const [rows] = await db.execute(
    `SELECT s.*, f.path, f.name FROM shares s
     JOIN files f ON s.file_id = f.id
     WHERE s.token = ?`,
    [token]
  );
  return rows[0];
};
