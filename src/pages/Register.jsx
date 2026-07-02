import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [avatar, setAvatar]     = useState(null);
  const [preview, setPreview]   = useState(null);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { register }            = useAuth();
  const navigate                = useNavigate();
  const fileRef                 = useRef();

  const handleAvatar = (file) => {
    if (!file) return;
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6)  { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await register(email, password, name);
      navigate('/dashboard');
    } catch {
      setError('Registration failed. This email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center">
      <div className="auth-card">
        <div className="brand">
          <span className="brand-icon">🔒</span>
          <span className="brand-name">SecureShare</span>
        </div>
        <h2>Create an account</h2>
        <p className="subtitle">Start storing and sharing files securely</p>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Avatar picker */}
        <div className="avatar-picker" onClick={() => fileRef.current.click()}>
          {preview
            ? <img src={preview} alt="avatar" className="avatar-preview" />
            : <div className="avatar-placeholder">📷<span>Add photo</span></div>
          }
          <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}}
            onChange={e => handleAvatar(e.target.files[0])} />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input id="name" type="text" placeholder="Your name"
              value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" placeholder="Min. 6 characters"
              value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
          </div>
          <div className="form-group">
            <label htmlFor="confirm">Confirm password</label>
            <input id="confirm" type="password" placeholder="Repeat your password"
              value={confirm} onChange={e => setConfirm(e.target.value)} required autoComplete="new-password" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Create account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
