import { useState, useEffect } from 'react';
import api from '../services/api';

const Notebook = () => {
  const [notes, setNotes]       = useState([]);
  const [active, setActive]     = useState(null); // current note
  const [title, setTitle]       = useState('');
  const [content, setContent]   = useState('');
  const [saved, setSaved]       = useState(true);
  const [shareEmails, setShareEmails] = useState('');
  const [sharing, setSharing]   = useState(false);
  const [shareMsg, setShareMsg] = useState('');

  useEffect(() => { fetchNotes(); }, []);

  const fetchNotes = async () => {
    const res = await api.get('/notes');
    setNotes(res.data);
  };

  const openNote = (note) => {
    setActive(note.id);
    setTitle(note.title);
    setContent(note.content || '');
    setSaved(true);
  };

  const newNote = () => {
    setActive(null);
    setTitle('');
    setContent('');
    setSaved(true);
  };

  const handleSave = async () => {
    const res = await api.post('/notes', { id: active, title: title || 'Untitled', content });
    if (!active) setActive(res.data.id);
    setSaved(true);
    fetchNotes();
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this note?')) return;
    await api.delete(`/notes/${id}`);
    if (active === id) newNote();
    fetchNotes();
  };

  const handleShare = async () => {
    if (!active || !shareEmails.trim()) return;
    setSharing(true);
    try {
      const emails = shareEmails.split(',').map(e => e.trim()).filter(Boolean);
      const res = await api.post(`/notes/${active}/share`, { emails, message: '' });
      setShareMsg(`Shared with ${res.data.recipients.join(', ') || 'no valid users'}`);
      setShareEmails('');
    } catch { setShareMsg('Share failed.'); }
    finally { setSharing(false); setTimeout(() => setShareMsg(''), 3000); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString(undefined, { month:'short', day:'numeric' }) : '';

  return (
    <div className="notebook">
      {/* Note list */}
      <div className="note-list">
        <div className="note-list-header">
          <span>📓 Notebook</span>
          <button className="btn btn-primary btn-sm" onClick={newNote} style={{width:'auto'}}>+ New</button>
        </div>
        {notes.length === 0 && <p className="note-empty">No notes yet.</p>}
        {notes.map(n => (
          <div key={n.id}
            className={`note-item${active === n.id ? ' active' : ''}`}
            onClick={() => openNote(n)}
          >
            <div className="note-item-title">{n.title || 'Untitled'}</div>
            <div className="note-item-meta">{formatDate(n.updated_at)}</div>
            <button className="note-delete-btn" onClick={(e) => handleDelete(n.id, e)}>✕</button>
          </div>
        ))}
      </div>

      {/* Editor */}
      <div className="note-editor">
        <input
          className="note-title-input"
          placeholder="Note title…"
          value={title}
          onChange={e => { setTitle(e.target.value); setSaved(false); }}
        />
        <textarea
          className="note-content"
          placeholder="Start writing…"
          value={content}
          onChange={e => { setContent(e.target.value); setSaved(false); }}
        />
        <div className="note-actions">
          <button className="btn btn-primary btn-sm" onClick={handleSave} style={{width:'auto'}}>
            {saved ? '✓ Saved' : '💾 Save'}
          </button>

          {active && (
            <div className="note-share-row">
              <input
                type="text"
                placeholder="Share: email1, email2…"
                value={shareEmails}
                onChange={e => setShareEmails(e.target.value)}
                className="note-share-input"
              />
              <button className="btn btn-ghost btn-sm" onClick={handleShare}
                disabled={sharing} style={{width:'auto'}}>
                {sharing ? <span className="spinner" /> : '🔗 Share'}
              </button>
            </div>
          )}
          {shareMsg && <div className="alert alert-success" style={{marginTop:'0.5rem'}}>{shareMsg}</div>}
        </div>
      </div>
    </div>
  );
};

export default Notebook;
