import db from '../config/db.js';

export const sendRequest = async (senderId, receiverId) => {
  const [result] = await db.execute(
    'INSERT IGNORE INTO friend_requests (sender_id, receiver_id) VALUES (?, ?)',
    [senderId, receiverId]
  );
  return result.insertId;
};

export const respondRequest = async (id, receiverId, status) => {
  await db.execute(
    'UPDATE friend_requests SET status = ? WHERE id = ? AND receiver_id = ?',
    [status, id, receiverId]
  );
};

// Requests received by this user (pending)
export const getIncomingRequests = async (userId) => {
  const [rows] = await db.execute(
    `SELECT fr.id, fr.status, fr.created_at,
            u.id as sender_id, u.email as sender_email, u.name as sender_name, u.avatar as sender_avatar
     FROM friend_requests fr
     JOIN users u ON fr.sender_id = u.id
     WHERE fr.receiver_id = ? AND fr.status = 'pending'
     ORDER BY fr.created_at DESC`,
    [userId]
  );
  return rows;
};

// Requests sent by this user
export const getOutgoingRequests = async (userId) => {
  const [rows] = await db.execute(
    `SELECT fr.id, fr.status, fr.created_at,
            u.id as receiver_id, u.email as receiver_email, u.name as receiver_name
     FROM friend_requests fr
     JOIN users u ON fr.receiver_id = u.id
     WHERE fr.sender_id = ?
     ORDER BY fr.created_at DESC`,
    [userId]
  );
  return rows;
};

// Accepted friends list
export const getFriends = async (userId) => {
  const [rows] = await db.execute(
    `SELECT u.id, u.email, u.name, u.avatar
     FROM friend_requests fr
     JOIN users u ON (
       CASE WHEN fr.sender_id = ? THEN fr.receiver_id ELSE fr.sender_id END = u.id
     )
     WHERE (fr.sender_id = ? OR fr.receiver_id = ?) AND fr.status = 'accepted'`,
    [userId, userId, userId]
  );
  return rows;
};

// All users except self, with friendship status
export const getAllUsersWithStatus = async (userId) => {
  const [rows] = await db.execute(
    `SELECT u.id, u.email, u.name, u.avatar, u.created_at,
            fr.id as request_id, fr.status as friend_status, fr.sender_id
     FROM users u
     LEFT JOIN friend_requests fr ON (
       (fr.sender_id = ? AND fr.receiver_id = u.id) OR
       (fr.receiver_id = ? AND fr.sender_id = u.id)
     )
     WHERE u.id != ? AND u.role = 'user'
     ORDER BY u.name ASC`,
    [userId, userId, userId]
  );
  return rows;
};
