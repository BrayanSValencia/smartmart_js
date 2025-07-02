import express from 'express';
import {login, logout  } from '../controllers/authcontroller.js';
import {authenticateToken, requireRole} from "../middleware/auth.js"
const router = express.Router();

router.post('/login/', login);
router.post('/logout/',authenticateToken,requireRole("user"), logout);



export default router;
