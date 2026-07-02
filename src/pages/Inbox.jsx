import { useState, useEffect } from 'react';
import api from '../services/api';
import FilePreview from '../components/FilePreview';

const formatDate = (d) => d ? new Date(d).toLocaleDateString(undefined, { month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';
const formatSize = (b = 0) => b < 1024*1024 ? `${(b/1024).toFixed(1)} KB` : `${(b/(1024*1024)).toFixed(1)} MB`;

const FILE_ICONS = {
  pdf:'📄', doc:'📝', docx:'📝', xls:'📊', xlsx:'📊',
  png:'🖼️', jpg:'🖼️', jpeg:'🖼️', gif:'🖼️', svg:'🖼️',
  mp4:'🎬', mp3:'🎵', zip:'🗜️', rar:'🗜️', default:'📎',
};
const getIcon = (name='') => FILE_ICONS[name.split('.').pop().toLowerCase()] || FILE_ICONS.default;

const Inbox = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewItem, setPreviewItem] = useState(null);

  const downloadUrl = (id) => {
    const token = localStorage.getItem('token');
    return `/api/files/download/${id}?token=${token}`;
  };

  useEffect(() => { fetchInbox(); }, []);

  const fetchInbox = async () => {
    try {
      const res = await api.get('/share/inbox');
      setItems(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (item) => {
    if (!item.seen) {
      await api.patch(`/share/${item.share_id}/seen`);
      setItems(prev => prev.map(i => i.share_id === item.share_id ? {...i, seen:1} : i));
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>📬 Shared with me</h1>
          <p style={{color:'var(--text-dim)',fontSize:'0.875rem'}}>Files other users have shared with you</p>
        </div>
      </div>

      {loading ? (
        <div className="empty-state"><span className="spinner" style={{width:32,height:32}} /></div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>Nothing here yet. When someone shares a file with you, it'll appear here.</p>
        </div>
      ) : (
        <div className="file-table">
          <div className="file-table-head" style={{gridTemplateColumns:'1fr auto auto auto'}}>
            <span>File</span><span>From</span><span>Date</span><span>Action</span>
          </div>
          {items.map(item => (
            <div key={item.share_id} className={`file-row${!item.seen?' file-row-unread':''}`}
              style={{gridTemplateColumns:'1fr auto auto auto'}}>
              <div className="file-info">
                <div className="file-icon">{getIcon(item.name)}</div>
                <div>
                  <div className="file-name"
                    style={{cursor:'pointer'}}
                    onClick={() => { handleDownload(item); setPreviewItem({id:item.file_id, name:item.name}); }}
                    title="Click to preview"
                  >
                    {!item.seen && <span className="unread-dot" />}
                    {item.name}
                  </div>
                  {item.message && (
                    <div style={{fontSize:'0.75rem',color:'var(--text-dim)',marginTop:'2px'}}>
                      "{item.message}"
                    </div>
                  )}
                </div>
              </div>
              <span className="file-size" style={{fontSize:'0.78rem'}}>{item.shared_by_email}</span>
              <span className="file-date">{formatDate(item.shared_at)}</span>
              <div className="file-actions">
                <button className="btn btn-ghost btn-sm"
                  onClick={() => { handleDownload(item); setPreviewItem({id:item.file_id, name:item.name}); }}
                  title="Preview">👁</button>
                <a className="btn btn-primary btn-sm"
                  href={downloadUrl(item.file_id)}
                  download={item.name}
                  onClick={() => handleDownload(item)}
                  style={{width:'auto'}}>
                  ⬇ Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {previewItem && (
        <FilePreview file={previewItem} onClose={() => setPreviewItem(null)} />
      )}
    </div>
  );
};

export default Inbox;
