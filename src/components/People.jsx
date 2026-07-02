import { useState, useEffect } from 'react';
import api from '../services/api';

const People = () => {
  const [users, setUsers]       = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [tab, setTab]           = useState('all'); // 'all' | 'requests'
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [u, inc] = await Promise.all([
        api.get('/friends/users'),
        api.get('/friends/incoming'),
      ]);
      setUsers(u.data);
      setIncoming(inc.data);
    } finally { setLoading(false); }
  };

  const sendRequest = async (receiverId) => {
    await api.post('/friends/request', { receiverId });
    fetchAll();
  };

  const respond = async (requestId, status) => {
    await api.patch(`/friends/request/${requestId}`, { status });
    fetchAll();
  };

  const filtered = users.filter(u =>
    (u.name || u.email).toLowerCase().includes(search.toLowerCase())
  );

  const initials = (u) => (u.name || u.email)[0].toUpperCase();

  const statusLabel = (u) => {
    if (!u.friend_status) return null;
    if (u.friend_status === 'accepted') return <span className="friend-badge accepted">✓ Friends</span>;
    if (u.friend_status === 'pending' && u.sender_id !== u.id)
      return <span className="friend-badge pending">⏳ Pending</span>;
    if (u.friend_status === 'pending')
      return <span className="friend-badge pending">⏳ Requested</span>;
    if (u.friend_status === 'declined') return null;
    return null;
  };

  return (
    <div className="people-panel">
      <div className="people-header">
        <span>👥 People</span>
        {incoming.length > 0 && <span className="badge-dot">{incoming.length}</span>}
      </div>

      <div className="tab-bar" style={{marginBottom:'0.75rem'}}>
        <button className={`tab-btn${tab==='all'?' active':''}`} onClick={() => setTab('all')}>All</button>
        <button className={`tab-btn${tab==='requests'?' active':''}`} onClick={() => setTab('requests')}>
          Requests {incoming.length > 0 && `(${incoming.length})`}
        </button>
      </div>

      {tab === 'requests' ? (
        <div className="people-list">
          {incoming.length === 0 && <p className="note-empty">No pending requests.</p>}
          {incoming.map(req => (
            <div key={req.id} className="person-row">
              <div className="person-avatar">
                {req.sender_avatar
                  ? <img src={req.sender_avatar} alt="" />
                  : <span>{(req.sender_name || req.sender_email)[0].toUpperCase()}</span>
                }
              </div>
              <div className="person-info">
                <div className="person-name">{req.sender_name || req.sender_email}</div>
                <div className="person-email">{req.sender_email}</div>
                <div className="person-email" style={{color:'var(--text-dim)',fontSize:'0.72rem'}}>
                  Wants to be your friend
                </div>
              </div>
              <div className="person-actions">
                <button className="btn btn-primary btn-sm" style={{width:'auto'}}
                  onClick={() => respond(req.id, 'accepted')}>✓</button>
                <button className="btn btn-danger btn-sm"
                  onClick={() => respond(req.id, 'declined')}>✕</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <input className="search-bar" style={{marginBottom:'0.75rem'}}
            placeholder="Search people…" value={search}
            onChange={e => setSearch(e.target.value)} />

          {loading ? <div style={{textAlign:'center',padding:'1rem'}}><span className="spinner" /></div> : (
            <div className="people-list">
              {filtered.length === 0 && <p className="note-empty">No users found.</p>}
              {filtered.map(u => (
                <div key={u.id} className="person-row">
                  <div className="person-avatar">
                    {u.avatar
                      ? <img src={u.avatar} alt="" />
                      : <span>{initials(u)}</span>
                    }
                  </div>
                  <div className="person-info">
                    <div className="person-name">{u.name || u.email}</div>
                    <div className="person-email">{u.email}</div>
                    {statusLabel(u)}
                  </div>
                  <div className="person-actions">
                    {!u.friend_status && (
                      <button className="btn btn-ghost btn-sm" style={{width:'auto'}}
                        onClick={() => sendRequest(u.id)} title="Send friend request">
                        ➕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default People;
