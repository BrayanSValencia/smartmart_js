import express from 'express';
import {  getUsers,requestRegistration,createUserAfterVerification,updateUser, deleteUser, deactivateUser, retrieveUser, getUser, requestStaffRegistration } from '../controllers/usercontroller.js';
import {authenticateToken, requireRole} from "../middleware/auth.js"
const router = express.Router();

router.get('/listusers/', authenticateToken,requireRole("admin"), getUsers);
router.get('/user/', authenticateToken,requireRole("user"), retrieveUser);
router.get('/getuser/:id', authenticateToken,requireRole("admin"), getUser);



router.post('/registeruser/', requestRegistration);
router.post('/registerstaffuser/', requestStaffRegistration);

router.get('/verifyemail/', createUserAfterVerification);
router.patch('/updateuser/', authenticateToken,requireRole("user"), updateUser); // partial update
router.put('/updateuser/', authenticateToken,requireRole("user"), updateUser);   // full update
router.delete('/deleteuser/:id', authenticateToken,requireRole("admin"), deleteUser);  
router.patch('/deactivateuser/', authenticateToken,requireRole("user"), deactivateUser);   


export default router;
