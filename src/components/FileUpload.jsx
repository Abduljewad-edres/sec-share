import { useState, useRef } from 'react';
import api from '../services/api';

const FileUpload = ({ onUpload }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef();

  const handleFile = (f) => {
    if (f) setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post('/files/upload', formData);
      setFile(null);
      onUpload();
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      {error && <div className="alert alert-error" style={{ width: '100%' }}>{error}</div>}

      <div
        className={`upload-zone${dragOver ? ' drag-over' : ''}`}
        style={{ width: '100%' }}
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="upload-icon">📁</div>
        <p>Drag &amp; drop a file here, or click to browse</p>
        {file && <div className="file-name">✓ {file.name}</div>}
        <input
          ref={inputRef}
          type="file"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={!file || loading}
        style={{ width: '100%' }}
      >
        {loading ? <><span className="spinner" /> Uploading…</> : '⬆ Upload file'}
      </button>
    </form>
  );
};

export default FileUpload;
