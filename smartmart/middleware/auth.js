import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { models } from '../config/db/pool.js';
dotenv.config()
// middleware/auth.js
export const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Token missing' });

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded; // Attach decoded token payload (includes role)
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Role-checking middleware 
export const requireRole = (roleName) => async (req, res, next) => {
  // 1. Find the role in DB to get its ID
    const role = await models.Roles.findOne({ 
      where: { name: roleName },
      attributes: ['id'], // Only fetch ID
      raw: true // Get plain object instead of model instance
    });
  
  // 2. Compare numeric IDs
  if (Number(req.user.role) !== Number(role.id)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  next();
};