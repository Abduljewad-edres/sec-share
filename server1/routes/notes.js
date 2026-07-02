import express from 'express';
import auth from '../middleware/auth.js';
import { listNotes, saveNote, removeNote, shareNote } from '../controllers/noteController.js';

const router = express.Router();

router.get('/',          auth, listNotes);
router.post('/',         auth, saveNote);
router.delete('/:id',    auth, removeNote);
router.post('/:id/share', auth, shareNote);

export default router;
