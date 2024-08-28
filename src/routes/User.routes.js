import express from 'express';
import { register, login, addMoney } from '../controllers/User.controller.js';
import { authentication } from '../Config/authentication.js';

const router = express();

router.post('/register', register);
router.post('/login', login);
router.post('/addMoney', authentication, addMoney);

export default router;
