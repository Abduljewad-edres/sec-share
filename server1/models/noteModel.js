import db from '../config/db.js';

export const getNotesByUser = async (userId) => {
  const [rows] = await db.execute(
    'SELECT id, title, content, updated_at, created_at FROM notes WHERE user_id = ? ORDER BY updated_at DESC',
    [userId]
  );
  return rows;
};

export const getNoteById = async (id, userId) => {
  const [rows] = await db.execute('SELECT * FROM notes WHERE id = ? AND user_id = ?', [id, userId]);
  return rows[0];
};

export const createNote = async (userId, title, content) => {
  const [result] = await db.execute(
    'INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)',
    [userId, title || 'Untitled', content || '']
  );
  return result.insertId;
};

export const updateNote = async (id, userId, title, content) => {
  await db.execute(
    'UPDATE notes SET title = ?, content = ? WHERE id = ? AND user_id = ?',
    [title, content, id, userId]
  );
};

export const deleteNote = async (id, userId) => {
  await db.execute('DELETE FROM notes WHERE id = ? AND user_id = ?', [id, userId]);
};
