import {
  createFile,
  getFilesByUser,
  deleteFile,
  findFileById,
  createShareToken,
  findShareByToken,
} from '../models/fileModel.js';
import { randomUUID } from 'crypto';
import fs from 'fs';

export const uploadFile = async (req, res) => {
  const { file } = req;
  if (!file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const fileId = await createFile(req.user.id, file.originalname, file.path, file.size);
    res.json({ id: fileId, name: file.originalname, size: file.size });
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ message: 'Upload failed', detail: err.message });
  }
};

export const getFiles = async (req, res) => {
  try {
    const files = await getFilesByUser(req.user.id);
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteFileHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const file = await findFileById(id);
    if (!file || file.user_id !== req.user.id)
      return res.status(404).json({ message: 'File not found' });

    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    await deleteFile(id, req.user.id);
    res.json({ message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const shareFile = async (req, res) => {
  const { id } = req.params;
  try {
    const file = await findFileById(id);
    if (!file || file.user_id !== req.user.id)
      return res.status(404).json({ message: 'File not found' });

    const token = randomUUID();
    // Optional: expire in 7 days
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await createShareToken(id, token, expiresAt);

    const link = `${req.protocol}://${req.get('host')}/share/${token}`;
    res.json({ link, token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const downloadShared = async (req, res) => {
  const { token } = req.params;
  try {
    const share = await findShareByToken(token);
    if (!share) return res.status(404).json({ message: 'Invalid or expired link' });

    if (share.expires_at && new Date(share.expires_at) < new Date())
      return res.status(410).json({ message: 'Link has expired' });

    res.download(share.path, share.name);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const downloadFile = async (req, res) => {
  const { id } = req.params;
  try {
    const file = await findFileById(id);
    if (!file) return res.status(404).json({ message: 'File not found' });

    // Allow owner OR anyone the file was shared with
    const isOwner = file.user_id === req.user.id;
    if (!isOwner) {
      // Check if shared with this user
      const [rows] = await (await import('../config/db.js')).default.execute(
        'SELECT id FROM file_shares WHERE file_id = ? AND shared_with = ?',
        [id, req.user.id]
      );
      if (!rows.length && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
    res.download(file.path, file.name);
  } catch (err) {
    console.error('Download error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/files/preview/:id — stream file inline for preview (image/audio/video)
export const previewFile = async (req, res) => {
  const { id } = req.params;
  try {
    const file = await findFileById(id);
    if (!file) return res.status(404).json({ message: 'File not found' });

    const isOwner = file.user_id === req.user.id;
    if (!isOwner) {
      const [rows] = await (await import('../config/db.js')).default.execute(
        'SELECT id FROM file_shares WHERE file_id = ? AND shared_with = ?',
        [id, req.user.id]
      );
      if (!rows.length && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const fs = await import('fs');
    if (!fs.default.existsSync(file.path)) {
      return res.status(404).json({ message: 'File not found on disk' });
    }

    // Detect mime type from extension
    const ext = file.name.split('.').pop().toLowerCase();
    const mimeMap = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
      gif: 'image/gif', svg: 'image/svg+xml', webp: 'image/webp',
      mp4: 'video/mp4', webm: 'video/webm', ogg: 'video/ogg',
      mp3: 'audio/mpeg', wav: 'audio/wav', aac: 'audio/aac',
      pdf: 'application/pdf',
    };
    const mime = mimeMap[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', `inline; filename="${file.name}"`);

    const stat = fs.default.statSync(file.path);
    const range = req.headers.range;

    // Support range requests for audio/video seeking
    if (range) {
      const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
      const start = parseInt(startStr, 10);
      const end = endStr ? parseInt(endStr, 10) : stat.size - 1;
      res.setHeader('Content-Range', `bytes ${start}-${end}/${stat.size}`);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Length', end - start + 1);
      res.status(206);
      fs.default.createReadStream(file.path, { start, end }).pipe(res);
    } else {
      res.setHeader('Content-Length', stat.size);
      fs.default.createReadStream(file.path).pipe(res);
    }
  } catch (err) {
    console.error('Preview error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
