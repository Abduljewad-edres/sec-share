import { findFileById } from '../models/fileModel.js';
import { createFileShare, getSharedWithUser, markShareSeen, countUnseen, getAllUsers } from '../models/shareModel.js';
import { findUserById } from '../models/userModel.js';
import { sendShareNotification } from '../services/emailService.js';

// POST /api/share  — share a file with one or more users
export const shareWithUsers = async (req, res) => {
  const { fileId, userIds, message } = req.body;
  const senderId = req.user.id;

  if (!fileId || !userIds?.length) {
    return res.status(400).json({ message: 'fileId and userIds are required' });
  }

  try {
    const file = await findFileById(fileId);
    if (!file) return res.status(404).json({ message: 'File not found' });

    // Admin can share any file; regular users can only share their own
    if (req.user.role !== 'admin' && file.user_id !== senderId) {
      return res.status(403).json({ message: 'Not authorized to share this file' });
    }

    const sender = await findUserById(senderId);
    const results = [];

    for (const uid of userIds) {
      const recipient = await findUserById(uid);
      if (!recipient) continue;

      await createFileShare(fileId, senderId, uid, message);

      // Send email notification
      const dashboardLink = `${process.env.APP_URL || 'http://localhost:5173'}/inbox`;
      try {
        await sendShareNotification({
          toEmail: recipient.email,
          fromEmail: sender.email,
          fileName: file.name,
          downloadLink: dashboardLink,
          message,
        });
      } catch (emailErr) {
        console.warn(`Email failed for ${recipient.email}:`, emailErr.message);
        // Don't fail the whole request if email fails
      }

      results.push(recipient.email);
    }

    res.json({ message: `File shared with ${results.length} user(s)`, recipients: results });
  } catch (err) {
    console.error('Share error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/share/inbox — get files shared with the current user
export const getInbox = async (req, res) => {
  try {
    const items = await getSharedWithUser(req.user.id);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/share/:shareId/seen
export const markSeen = async (req, res) => {
  try {
    await markShareSeen(req.params.shareId, req.user.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/share/unseen-count
export const getUnseenCount = async (req, res) => {
  try {
    const count = await countUnseen(req.user.id);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/share/users — list all users (for share picker)
export const listUsers = async (req, res) => {
  try {
    const users = await getAllUsers(req.user.id);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
