import db from '../config/db.js';

// Share a file with a user internally
export const createFileShare = async (fileId, sharedBy, sharedWith, message) => {
  const [result] = await db.execute(
    'INSERT INTO file_shares (file_id, shared_by, shared_with, message) VALUES (?, ?, ?, ?)',
    [fileId, sharedBy, sharedWith, message || null]
  );
  return result.insertId;
};

// Get all files shared WITH a user (their inbox)
export const getSharedWithUser = async (userId) => {
  const [rows] = await db.execute(
    `SELECT fs.id as share_id, fs.message, fs.seen, fs.created_at as shared_at,
            f.id as file_id, f.name, f.size,
            u.email as shared_by_email
     FROM file_shares fs
     JOIN files f ON fs.file_id = f.id
     JOIN users u ON fs.shared_by = u.id
     WHERE fs.shared_with = ?
     ORDER BY fs.created_at DESC`,
    [userId]
  );
  return rows;
};

// Mark a share as seen
export const markShareSeen = async (shareId, userId) => {
  await db.execute(
    'UPDATE file_shares SET seen = 1 WHERE id = ? AND shared_with = ?',
    [shareId, userId]
  );
};

// Count unseen shares for a user
export const countUnseen = async (userId) => {
  const [rows] = await db.execute(
    'SELECT COUNT(*) as count FROM file_shares WHERE shared_with = ? AND seen = 0',
    [userId]
  );
  return rows[0].count;
};

// Get all registered users (for share picker) — exclude self
export const getAllUsers = async (excludeId) => {
  const [rows] = await db.execute(
    'SELECT id, email, role FROM users WHERE id != ? ORDER BY email ASC',
    [excludeId]
  );
  return rows;
};
