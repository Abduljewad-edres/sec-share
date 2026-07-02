import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: '🔐', title: 'End-to-end secure', desc: 'Files are protected with JWT-authenticated access.' },
  { icon: '🔗', title: 'Shareable links', desc: 'Generate a link to share any file instantly.' },
  { icon: '⚡', title: 'Fast uploads', desc: 'Drag-and-drop uploads with real-time feedback.' },
  { icon: '🗂️', title: 'File management', desc: 'View, download, and delete your files anytime.' },
];

const Home = () => {
  const { user } = useAuth();

  return (
    <>
      <section className="home-hero">
        <span className="badge">✦ Secure file storage &amp; sharing</span>
        <h1>Store and share files<br />with confidence</h1>
        <p>SecureShare gives you a private space to upload, manage, and share files — protected by secure authentication.</p>
        <div className="cta-group">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary">Go to Dashboard →</Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary">Get started free</Link>
              <Link to="/login" className="btn btn-secondary">Sign in</Link>
            </>
          )}
        </div>
      </section>

      <div className="features-grid">
        {features.map((f) => (
          <div key={f.title} className="feature-card">
            <div className="icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default Home;
