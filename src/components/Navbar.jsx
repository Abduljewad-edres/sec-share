import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import api from '../services/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unseen, setUnseen] = useState(0);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      api.get('/share/unseen-count')
        .then(r => setUnseen(r.data.count))
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="brand-icon">{user?.role === 'admin' ? '🛡️' : '🔒'}</span>
        <span className="brand-name">{user?.role === 'admin' ? 'Admin Panel' : 'SecureShare'}</span>
      </Link>

      <div className="navbar-links">
        {user ? (
          user.role === 'admin' ? (
            <>
              <Link to="/admin/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="btn btn-ghost btn-sm">My Files</Link>
              <Link to="/inbox" className="btn btn-ghost btn-sm" style={{position:'relative'}}>
                📬 Inbox
                {unseen > 0 && (
                  <span className="badge-dot">{unseen}</span>
                )}
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">Sign out</button>
            </>
          )
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get started</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
