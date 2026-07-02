import { useState } from 'react';
import api from '../services/api';
import ShareModal from './ShareModal';
import FilePreview from './FilePreview';

const FILE_ICONS = {
  pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊',
  png: '🖼️', jpg: '🖼️', jpeg: '🖼️', gif: '🖼️', svg: '🖼️',
  mp4: '🎬', mp3: '🎵', zip: '🗜️', rar: '🗜️', default: '📎',
};

const getIcon = (name = '') => {
  const ext = name.split('.').pop().toLowerCase();
  return FILE_ICONS[ext] || FILE_ICONS.default;
};

const formatSize = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const FileList = ({ files, onDelete }) => {
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [shareTarget, setShareTarget] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);

  const downloadUrl = (id) => {
    const token = localStorage.getItem('token');
    return `/api/files/download/${id}?token=${token}`;
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this file?')) return;
    await api.delete(`/files/${id}`);
    onDelete();
  };

  const handleShare = async (id) => {
    const res = await api.post(`/files/${id}/share`);
    setShareLink(res.data.link);
    setCopied(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!files.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📂</div>
        <p>No files yet. Upload your first file above.</p>
      </div>
    );
  }

  return (
    <>
      <div className="file-table">
        <div className="file-table-head">
          <span>Name</span>
          <span>Size</span>
          <span>Uploaded</span>
          <span>Actions</span>
        </div>

        {files.map((file) => (
          <div key={file.id} className="file-row">
            <div className="file-info">
              <div className="file-icon">{getIcon(file.name || file.original_name)}</div>
              <span
                className="file-name"
                style={{cursor:'pointer'}}
                onClick={() => setPreviewFile(file)}
                title="Click to preview"
              >{file.name || file.original_name}</span>
            </div>
            <span className="file-size">{formatSize(file.size)}</span>
            <span className="file-date">{formatDate(file.created_at)}</span>
            <div className="file-actions">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setPreviewFile(file)}
                title="Preview"
              >👁</button>
              <a
                className="btn btn-ghost btn-sm"
                href={downloadUrl(file.id)}
                download={file.name}
                title="Download"
              >⬇</a>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShareTarget(file)}
                title="Share with users"
              >👤</button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => handleShare(file.id)}
                title="Copy link"
              >🔗</button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDelete(file.id)}
                title="Delete"
              >🗑</button>
            </div>
          </div>
        ))}
      </div>

      {shareLink && (
        <div className="modal-overlay" onClick={() => setShareLink('')}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Share link</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
              Anyone with this link can access the file.
            </p>
            <div className="share-link-box">
              <input type="text" readOnly value={shareLink} />
              <button className="btn btn-primary btn-sm" onClick={copyLink}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setShareLink('')}>Close</button>
            </div>
          </div>
        </div>
      )}

      {shareTarget && (
        <ShareModal
          file={shareTarget}
          onClose={() => setShareTarget(null)}
          onShared={() => setShareTarget(null)}
        />
      )}

      {previewFile && (
        <FilePreview
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </>
  );
};

export default FileList;
