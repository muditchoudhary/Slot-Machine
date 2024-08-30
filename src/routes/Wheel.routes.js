import express from 'express';
import { spinWheel } from '../controllers/Wheel.controller.js';
import { authentication } from '../Config/authentication.js';

const router = express();

router.post('/spin', authentication, spinWheel);
// router.get('/deductMoney', authentication, deductMoney);

export default router;
