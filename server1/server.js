import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import fileRoutes from './routes/files.js';
import shareRoutes from './routes/share.js';
import adminRoutes from './routes/admin.js';
import noteRoutes from './routes/notes.js';
import friendRoutes from './routes/friends.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test DB connection on startup
import db from './config/db.js';
db.query('SELECT 1').then(() => console.log('✅ Database connected')).catch((e) => console.error('❌ Database connection failed:', e.message));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',    authRoutes);
app.use('/api/files',   fileRoutes);
app.use('/api/share',   shareRoutes);
app.use('/api/admin',   adminRoutes);
app.use('/api/notes',   noteRoutes);
app.use('/api/friends', friendRoutes);

app.get('/', (req, res) => {
  res.send('SecureShare Server is Running');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
