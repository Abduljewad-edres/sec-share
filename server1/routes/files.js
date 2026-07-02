import express from 'express';
import {
  uploadFile,
  getFiles,
  deleteFileHandler,
  shareFile,
  downloadShared,
  downloadFile,
  previewFile,
} from '../controllers/fileController.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Wrap multer so its errors are caught and returned as JSON
const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err.message);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

router.post('/upload', auth, handleUpload, uploadFile);
router.get('/', auth, getFiles);
router.delete('/:id', auth, deleteFileHandler);
router.post('/:id/share', auth, shareFile);
router.get('/download/:id', auth, downloadFile);
router.get('/preview/:id', auth, previewFile);
router.get('/shared/:token', downloadShared);

export default router;
