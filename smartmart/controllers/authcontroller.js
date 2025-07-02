
import { models } from '../config/db/pool.js';
import { loginInputSchema } from '../serializers/loginserializer.js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid'; 

dotenv.config()

export const login = async (req, res) => {
  try {
    // 1. Validate request body
    const data = loginInputSchema.parse(req.body);

    // 2. Find user by email
    const login = await models.Login.findOne({ where: { email: data.email} });
    if (!login) {
      return res.status(401).json({ error: 'Invalid email, password, or account is inactive' });
    }

    // 3. Verify password
    const passwordMatch =  bcrypt.compare(data.password,login.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email, password, or account is inactive' });
    }

    const user=await models.User.findOne({ where: { id: login.userId, isActive:true} });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email, password, or account is inactive' });
    }



    // 4. Generate access and refresh tokens
    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, role:user.roleId, jti: uuidv4() },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    const refreshJti = uuidv4();
    const refreshToken = jwt.sign(
      { sub: user.id, jti: refreshJti },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    const oneDay = 24 * 60 * 60 * 1000; // 1 day in milliseconds

    // 5. Store refresh token in DB
    const savedToken=await models.RefreshToken.create({
      userId: user.id,
      token: refreshToken,
      jti: refreshJti,
      issuedAt: new Date(Date.now()),
      expiresAt: new Date(Date.now() + oneDay*7),
      revoked: false
    });

    if (!savedToken) {
      return res.status(400).json({ error: 'There was a server-side error. Please try again.' });
    }

    // 6. Return response
    return res.status(200).json({
      "Access token":accessToken,
      "Refresh token":refreshToken
    });

  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ errors: err.errors });
    }
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};


export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    // Find the refresh token in DB
    const storedToken = await models.RefreshToken.findOne({
      where: { token: refreshToken, revoked: false }
    });

    if (!storedToken) {
      return res.status(400).json({ error: 'Invalid or already revoked token' });
    }

    // Mark it as revoked
    storedToken.revoked = true;
    await storedToken.save();

    return res.status(200).json({ message: 'Successfully logged out' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error during logout' });
  }
};
