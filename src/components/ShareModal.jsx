import { useState, useEffect } from 'react';
import api from '../services/api';

const ShareModal = ({ file, onClose, onShared }) => {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/share/users').then(r => setUsers(r.data)).catch(() => {});
  }, []);

  const toggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleShare = async () => {
    if (!selected.length) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/share', {
        fileId: file.id,
        userIds: selected,
        message,
      });
      setSuccess(`Shared with ${res.data.recipients.join(', ')}`);
      setTimeout(() => { onShared(); }, 1800);
    } catch {
      setError('Failed to share. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:500}} onClick={e => e.stopPropagation()}>
        <h3>Share "{file.name}"</h3>
        <p style={{fontSize:'0.85rem',color:'var(--text-dim)',marginBottom:'1rem'}}>
          Select users to share with. They'll get an in-app notification and an email.
        </p>

        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">✓ {success}</div>}

        <div className="form-group">
          <label>Search users</label>
          <input
            type="text"
            placeholder="Filter by email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="user-picker">
          {filtered.length === 0 && (
            <p style={{color:'var(--text-dim)',fontSize:'0.85rem',padding:'0.5rem 0'}}>No users found.</p>
          )}
          {filtered.map(u => (
            <label key={u.id} className={`user-pick-row${selected.includes(u.id)?' selected':''}`}>
              <input
                type="checkbox"
                checked={selected.includes(u.id)}
                onChange={() => toggle(u.id)}
              />
              <span className="user-avatar">{u.email[0].toUpperCase()}</span>
              <span className="user-email">{u.email}</span>
              {selected.includes(u.id) && <span className="check-badge">✓</span>}
            </label>
          ))}
        </div>

        <div className="form-group" style={{marginTop:'1rem'}}>
          <label>Message (optional)</label>
          <input
            type="text"
            placeholder="Add a note for the recipient…"
            value={message}
            onChange={e => setMessage(e.target.value)}
            maxLength={200}
          />
        </div>

        <div className="modal-footer" style={{gap:'0.5rem'}}>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleShare}
            disabled={!selected.length || loading}
            style={{width:'auto'}}
          >
            {loading ? <span className="spinner" /> : `Share with ${selected.length || ''} user${selected.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
