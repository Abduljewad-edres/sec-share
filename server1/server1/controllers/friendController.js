import { sendRequest, respondRequest, getIncomingRequests, getOutgoingRequests, getFriends, getAllUsersWithStatus } from '../models/friendModel.js';

export const listUsers = async (req, res) => {
  try {
    const users = await getAllUsersWithStatus(req.user.id);
    res.json(users);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

export const sendFriendRequest = async (req, res) => {
  const { receiverId } = req.body;
  if (!receiverId) return res.status(400).json({ message: 'receiverId required' });
  try {
    await sendRequest(req.user.id, receiverId);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

export const respondFriendRequest = async (req, res) => {
  const { status } = req.body; // 'accepted' or 'declined'
  if (!['accepted','declined'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
  try {
    await respondRequest(req.params.id, req.user.id, status);
    res.json({ ok: true, status });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

export const incoming = async (req, res) => {
  try { res.json(await getIncomingRequests(req.user.id)); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};

export const outgoing = async (req, res) => {
  try { res.json(await getOutgoingRequests(req.user.id)); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};

export const friends = async (req, res) => {
  try { res.json(await getFriends(req.user.id)); }
  catch (err) { res.status(500).json({ message: 'Server error' }); }
};
