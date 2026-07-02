import { getNotesByUser, getNoteById, createNote, updateNote, deleteNote } from '../models/noteModel.js';
import { createFileShare } from '../models/shareModel.js';
import { findUserByEmail } from '../models/userModel.js';
import db from '../config/db.js';

export const listNotes = async (req, res) => {
  try {
    const notes = await getNotesByUser(req.user.id);
    res.json(notes);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

export const saveNote = async (req, res) => {
  const { id, title, content } = req.body;
  try {
    if (id) {
      await updateNote(id, req.user.id, title, content);
      res.json({ id, title, content });
    } else {
      const newId = await createNote(req.user.id, title, content);
      res.json({ id: newId, title, content });
    }
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

export const removeNote = async (req, res) => {
  try {
    await deleteNote(req.params.id, req.user.id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// Share a note as a virtual "file" — store it in files table as text
export const shareNote = async (req, res) => {
  const { emails, message } = req.body;
  const noteId = req.params.id;
  try {
    const note = await getNoteById(noteId, req.user.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    // Save note content as a temp file entry
    const [result] = await db.execute(
      "INSERT INTO files (user_id, name, path, size) VALUES (?, ?, ?, ?)",
      [req.user.id, `${note.title}.txt`, `note:${noteId}`, Buffer.byteLength(note.content || '', 'utf8')]
    );
    const fileId = result.insertId;

    const recipients = [];
    for (const email of emails) {
      const user = await findUserByEmail(email.trim());
      if (user && user.id !== req.user.id) {
        await createFileShare(fileId, req.user.id, user.id, message);
        recipients.push(email);
      }
    }
    res.json({ shared: recipients.length, recipients });
  } catch (err) {
    console.error('Share note error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
