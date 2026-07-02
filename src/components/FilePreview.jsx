import { useEffect } from 'react';

const IMAGE_EXT = ['jpg','jpeg','png','gif','svg','webp'];
const VIDEO_EXT = ['mp4','webm','ogg'];
const AUDIO_EXT = ['mp3','wav','aac','ogg'];
const PDF_EXT   = ['pdf'];

const getType = (name = '') => {
  const ext = name.split('.').pop().toLowerCase();
  if (IMAGE_EXT.includes(ext)) return 'image';
  if (VIDEO_EXT.includes(ext)) return 'video';
  if (AUDIO_EXT.includes(ext)) return 'audio';
  if (PDF_EXT.includes(ext))   return 'pdf';
  return 'other';
};

// Build authenticated preview URL using token from localStorage
const previewUrl = (fileId) => {
  const token = localStorage.getItem('token');
  return `/api/files/preview/${fileId}?token=${token}`;
};

const downloadUrl = (fileId) => {
  const token = localStorage.getItem('token');
  return `/api/files/download/${fileId}?token=${token}`;
};

const FilePreview = ({ file, onClose }) => {
  const type = getType(file.name);
  const src  = previewUrl(file.id);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="preview-modal" onClick={e => e.stopPropagation()}>
        <div className="preview-header">
          <span className="preview-title">{file.name}</span>
          <div style={{display:'flex',gap:'0.5rem'}}>
            <a
              href={downloadUrl(file.id)}
              className="btn btn-primary btn-sm"
              style={{width:'auto'}}
              download={file.name}
            >
              ⬇ Download
            </a>
            <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="preview-body">
          {type === 'image' && (
            <img src={src} alt={file.name} className="preview-image" />
          )}

          {type === 'video' && (
            <video controls className="preview-video" autoPlay={false}>
              <source src={src} />
              Your browser does not support video playback.
            </video>
          )}

          {type === 'audio' && (
            <div className="preview-audio-wrap">
              <div className="audio-icon">🎵</div>
              <p className="audio-name">{file.name}</p>
              <audio controls className="preview-audio">
                <source src={src} />
                Your browser does not support audio playback.
              </audio>
            </div>
          )}

          {type === 'pdf' && (
            <iframe
              src={src}
              className="preview-pdf"
              title={file.name}
            />
          )}

          {type === 'other' && (
            <div className="preview-unsupported">
              <div style={{fontSize:'3rem',marginBottom:'1rem'}}>📎</div>
              <p>Preview not available for this file type.</p>
              <a
                href={downloadUrl(file.id)}
                className="btn btn-primary"
                style={{width:'auto',marginTop:'1rem'}}
                download={file.name}
              >
                ⬇ Download file
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreview;
