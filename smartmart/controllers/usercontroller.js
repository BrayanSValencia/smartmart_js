import { models } from '../config/db/pool.js';
import { userInputSchema, userOutputSerializer,registerInputSchema } from '../serializers/userserializer.js';
import { sequelize } from '../config/db/pool.js';
import NodeCache from 'node-cache';
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'; 
import jwt from 'jsonwebtoken';
import {sendVerificationEmail} from './mail.js'
const tokenCache = new NodeCache({ stdTTL: 300 }); // 5 minutes TTL

export const getUsers = async (req, res) => {

  try{
  const users = await models.User.findAll();
  res.json(users.map(userOutputSerializer));
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const retrieveUser = async (req, res) => {
  const userId = req.user.sub; // no need to check again because of the middleware

  try{
  const user = await models.User.findOne({ where: { id: userId } });
  res.json(userOutputSerializer(user));
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};


export const getUser = async (req, res) => {
  const requestedId = req.params.id;
  try{
  const user = await models.User.findOne({ where: { id: requestedId } });
  res.json(userOutputSerializer(user));
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const requestStaffRegistration = async (req, res) => {
  try {
    const data = registerInputSchema.parse(req.body);
    const { email, password, ...userData } = data;

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingLogin = await models.Login.findOne({ where: { email } });
    if (existingLogin) {
      return res.status(409).json({ error: 'Email already in use.' });
    }

    const existingUser = await models.User.findOne({ where: { username: userData.username } });
    if (existingUser) {
      return res.status(409).json({ error: 'Username already in use.' });
    }

    const transaction = await sequelize.transaction();

    try {
      // Create staff user with role_id = 2
      const user = await models.User.create(
        { ...userData, role_id: 2 },
        { transaction }
      );

      // Create login record 
      await models.Login.create(
        {
          email,
          password: hashedPassword,
          user_id: user.id,
         
        },
        { transaction }
      );

      await transaction.commit();

      return res.status(201).json({ 
        message: 'Staff account created successfully.'
      });
    } catch (err) {
      await transaction.rollback();
      console.error(err);
      return res.status(500).json({ error: 'Failed to create staff account' });
    }

  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ errors: err.errors });
    }
    console.error(err);
    return res.status(500).json({ error: 'Server error during staff registration' });
  }
};


export const requestRegistration = async (req, res) => {
  try {
    const data = registerInputSchema.parse(req.body);
    const { email, password, ...userData } = data;

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingLogin = await models.Login.findOne({ where: { email } });
    if (existingLogin) {
      return res.status(409).json({ error: 'Email already in use.' });
    }

    const existingUser = await models.User.findOne({ where: { username: userData.username } });
    if (existingUser) {
      return res.status(409).json({ error: 'Username already in use.' });
    }

    // Generate unique ID for token tracking
    const jti = uuidv4();

    // Store jti temporarily in cache (used to verify it's not reused)
    tokenCache.set(jti, true); 

    // Sign token with jti included
    const token = jwt.sign(
      { email, password: hashedPassword, userData, jti },
      process.env.EMAIL_TOKEN_SECRET,
      { expiresIn: '5m' }
    );

    const link = `http://127.0.0.1:3000/api/users/verifyemail/?token=${token}`;
    await sendVerificationEmail(email, link);

    return res.status(200).json({ message: 'Verification email sent.' });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ errors: err.errors });
    }
    console.error(err);
    return res.status(500).json({ error: 'Server error sending email' });
  }
};


export const createUserAfterVerification = async (req, res) => {
  const token = req.query.token;

  try {
    const decoded = jwt.verify(token, process.env.EMAIL_TOKEN_SECRET);
    const { email, password, userData, jti } = decoded;

    // Check if the token was already used
    if (!tokenCache.has(jti)) {
      return res.status(400).json({ error: 'Token already used or expired.' });
    }

    // Delete token to prevent reuse
    tokenCache.del(jti);

    const existingLogin = await models.Login.findOne({ where: { email } });
    if (existingLogin) {
      return res.status(409).json({ error: 'Cannot complete verification. Email already registered.' });
    }

    const existingUser = await models.User.findOne({ where: { username: userData.username } });
    if (existingUser) {
      return res.status(409).json({ error: 'Cannot complete verification. Username already registered.' });
    }

    const transaction = await sequelize.transaction();

    try {
      const user = await models.User.create(userData, { transaction });
      await models.Login.create({ email, password, userId: user.id }, { transaction });

      await transaction.commit();

      return res.status(201).json({ message: 'Account verified and created.' });
    } catch (err) {
      await transaction.rollback();
      console.error(err);
      return res.status(500).json({ error: 'Failed to create account after verification' });
    }

  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: 'Invalid or expired token.' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.user.sub; // no need to check again because of the middleware

    const schema = req.method === 'PATCH'
      ? userInputSchema.partial()
      : userInputSchema;

    const data = schema.parse(req.body);

    const user = await models.User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.update(data);

    res.json(userOutputSerializer(user));
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ errors: err.errors });
    }
    res.status(500).json({ error: 'Server error' });
  }
};


export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id; // no need to check again because of the middleware

    const user = await models.User.destroy({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.status(204).json({message: 'User deleted successfully.' })

  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ errors: err.errors });
    }
    res.status(500).json({ error: 'Server error' });
  }
};


export const deactivateUser = async (req, res) => {
  try {
    const userId = req.user.sub; // no need to check again because of the middleware

    const user = await models.User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.update({isActive:false});

    res.json({message:"Account deactivated successfully."});
  } catch (err) {
   
    res.status(500).json({ error: 'Server error' });
  }
};