import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  // Accept token from Authorization header OR query string (for media/download URLs)
  const token =
    req.header('Authorization')?.replace('Bearer ', '') ||
    req.query.token;

  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded; // contains { id, role }
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export default auth;
