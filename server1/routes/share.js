import express from 'express';
import auth from '../middleware/auth.js';
import { shareWithUsers, getInbox, markSeen, getUnseenCount, listUsers } from '../controllers/shareController.js';

const router = express.Router();

router.post('/', auth, shareWithUsers);
router.get('/inbox', auth, getInbox);
router.get('/users', auth, listUsers);
router.get('/unseen-count', auth, getUnseenCount);
router.patch('/:shareId/seen', auth, markSeen);

export default router;
