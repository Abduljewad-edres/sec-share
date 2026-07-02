import express from 'express';
import auth from '../middleware/auth.js';
import { listUsers, sendFriendRequest, respondFriendRequest, incoming, outgoing, friends } from '../controllers/friendController.js';

const router = express.Router();

router.get('/users',          auth, listUsers);
router.get('/incoming',       auth, incoming);
router.get('/outgoing',       auth, outgoing);
router.get('/list',           auth, friends);
router.post('/request',       auth, sendFriendRequest);
router.patch('/request/:id',  auth, respondFriendRequest);

export default router;
