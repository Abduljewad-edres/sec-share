import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';
import Notebook from '../components/Notebook';
import People from '../components/People';

const formatSize = (b) => b < 1024*1024 ? `${(b/1024).toFixed(1)} KB` : `${(b/(1024*1024)).toFixed(1)} MB`;

const searchOnline = async (query) => {
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return { title: data.title, extract: data.extract, url: data.content_urls?.desktop?.page, thumbnail: data.thumbnail?.source };
  } catch { return null; }
};

const Dashboard = () => {
  const { user } = useAuth();
  const [files, setFiles]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [onlineResult, setOnlineResult] = useState(null);
  const [searching, setSearching]       = useState(false);
  const [sideTab, setSideTab] = useState('notebook');

  const fetchFiles = async () => {
    try { const res = await api.get('/files'); setFiles(res.data); }
    catch { setFiles([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchFiles(); }, []);

  const filtered = search.trim()
    ? files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : files;

  useEffect(() => {
    setOnlineResult(null);
    if (!search.trim() || filtered.length > 0) return;
    const timer = setTimeout(async () => {
      setSearching(true);
      setOnlineResult(await searchOnline(search.trim()));
      setSearching(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [search, filtered.length]);

  const totalSize = files.reduce((a, f) => a + (f.size || 0), 0);
  const initials  = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : '?';

  return (
    <div className="dashboard-layout">
      {/* ── Left Sidebar ── */}
      <aside className="left-sidebar">
        <div className="sidebar-tabs">
          <button className={`sidebar-tab${sideTab==='notebook'?' active':''}`}
            onClick={() => setSideTab('notebook')} title="Notebook">📓</button>
          <button className={`sidebar-tab${sideTab==='people'?' active':''}`}
            onClick={() => setSideTab('people')} title="People">👥</button>
        </div>
        <div className="sidebar-content">
          {sideTab === 'notebook' ? <Notebook /> : <People />}
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="dashboard">
        <div className="welcome-header">
          <div className="welcome-left">
            {user?.avatar
              ? <img src={user.avatar} alt="avatar" className="welcome-avatar" />
              : <div className="welcome-avatar-initials">{initials}</div>
            }
            <div>
              <h1>Welcome, {user?.name || user?.email} 👋</h1>
              <p style={{color:'var(--text-dim)',fontSize:'0.875rem'}}>{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Total files</div>
            <div className="stat-value">{loading ? '…' : files.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Storage used</div>
            <div className="stat-value">{loading ? '…' : formatSize(totalSize)}</div>
          </div>
        </div>

        <FileUpload onUpload={fetchFiles} />

        <div className="search-bar-wrap">
          <span className="search-icon">🔍</span>
          <input className="search-bar" type="text"
            placeholder="Search your files… or anything online"
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>

        {search.trim() && filtered.length === 0 && (
          <div className="online-result-wrap">
            {searching && (
              <div className="online-result-card">
                <span className="spinner" style={{width:20,height:20}} />
                <span style={{marginLeft:'0.75rem',color:'var(--text-dim)'}}>Searching online…</span>
              </div>
            )}
            {!searching && onlineResult && (
              <div className="online-result-card">
                <div className="online-result-header">
                  <span className="online-badge">🌐 Online result</span>
                  <a href={onlineResult.url} target="_blank" rel="noreferrer"
                    className="btn btn-ghost btn-sm" style={{width:'auto'}}>Open →</a>
                </div>
                {onlineResult.thumbnail && <img src={onlineResult.thumbnail} alt={onlineResult.title} className="online-thumb" />}
                <h3 style={{margin:'0.5rem 0 0.3rem'}}>{onlineResult.title}</h3>
                <p style={{fontSize:'0.85rem',color:'var(--text-dim)',lineHeight:1.6}}>
                  {onlineResult.extract?.slice(0,300)}{onlineResult.extract?.length > 300 ? '…' : ''}
                </p>
              </div>
            )}
            {!searching && !onlineResult && (
              <div className="online-result-card" style={{color:'var(--text-dim)',fontSize:'0.875rem'}}>
                No results found for "{search}".
              </div>
            )}
          </div>
        )}

        <div className="file-list-header">
          <h2>{filtered.length} file{filtered.length !== 1 ? 's' : ''}{search ? ` matching "${search}"` : ''}</h2>
        </div>

        {loading
          ? <div className="empty-state"><span className="spinner" style={{width:32,height:32}} /></div>
          : <FileList files={filtered} onDelete={fetchFiles} />
        }
      </div>
    </div>
  );
};

export default Dashboard;
