import { useState, useEffect } from 'react';
import api from '../services/api';
import ShareModal from '../components/ShareModal';

const formatSize = (b = 0) => b < 1024 * 1024 ? `${(b/1024).toFixed(1)} KB` : `${(b/(1024*1024)).toFixed(1)} MB`;
const formatDate = (d) => d ? new Date(d).toLocaleDateString(undefined, { month:'short', day:'numeric', year:'numeric' }) : '—';

const AdminDashboard = () => {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareTarget, setShareTarget] = useState(null); // file to share

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [u, f] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/files'),
      ]);
      setUsers(u.data);
      setFiles(f.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Delete this user and all their files?')) return;
    await api.delete(`/admin/users/${id}`);
    fetchAll();
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>🛡️ Admin Dashboard</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Manage users and files</p>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Total users</div>
          <div className="stat-value">{users.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total files</div>
          <div className="stat-value">{files.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total storage</div>
          <div className="stat-value">{formatSize(files.reduce((a, f) => a + (f.size||0), 0))}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button className={`tab-btn${tab==='users'?' active':''}`} onClick={() => setTab('users')}>
          👥 Users ({users.length})
        </button>
        <button className={`tab-btn${tab==='files'?' active':''}`} onClick={() => setTab('files')}>
          📁 All Files ({files.length})
        </button>
      </div>

      {loading ? (
        <div className="empty-state"><span className="spinner" style={{width:32,height:32}} /></div>
      ) : tab === 'users' ? (
        <div className="file-table">
          <div className="file-table-head" style={{gridTemplateColumns:'1fr auto auto auto'}}>
            <span>Email</span><span>Files</span><span>Joined</span><span>Actions</span>
          </div>
          {users.length === 0 && <div className="empty-state"><p>No users yet.</p></div>}
          {users.map(u => (
            <div key={u.id} className="file-row" style={{gridTemplateColumns:'1fr auto auto auto'}}>
              <div className="file-info">
                <div className="file-icon">👤</div>
                <span className="file-name">{u.email}</span>
              </div>
              <span className="file-size">{u.file_count} files</span>
              <span className="file-date">{formatDate(u.created_at)}</span>
              <div className="file-actions">
                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u.id)} title="Delete user">🗑</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="file-table">
          <div className="file-table-head" style={{gridTemplateColumns:'1fr auto auto auto auto'}}>
            <span>File</span><span>Owner</span><span>Size</span><span>Date</span><span>Actions</span>
          </div>
          {files.length === 0 && <div className="empty-state"><p>No files yet.</p></div>}
          {files.map(f => (
            <div key={f.id} className="file-row" style={{gridTemplateColumns:'1fr auto auto auto auto'}}>
              <div className="file-info">
                <div className="file-icon">📎</div>
                <span className="file-name">{f.name}</span>
              </div>
              <span className="file-size" style={{fontSize:'0.78rem'}}>{f.owner_email}</span>
              <span className="file-size">{formatSize(f.size)}</span>
              <span className="file-date">{formatDate(f.created_at)}</span>
              <div className="file-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => setShareTarget(f)} title="Share with users">🔗 Share</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {shareTarget && (
        <ShareModal
          file={shareTarget}
          onClose={() => setShareTarget(null)}
          onShared={() => setShareTarget(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
