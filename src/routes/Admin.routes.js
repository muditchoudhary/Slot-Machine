import express from 'express';
import { login, userList } from '../controllers/Admin.controller.js';
import { authentication } from '../Config/authentication.js';

const router = express();

router.post('/login', login);
router.get('/user-list', authentication, userList);

export default router;
