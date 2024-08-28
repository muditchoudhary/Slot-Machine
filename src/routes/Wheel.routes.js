import express from 'express';
import { spinWheel } from '../controllers/Wheel.controller.js';
import { authentication } from '../Config/authentication.js';

const router = express();

router.get('/spin', authentication, spinWheel);

export default router;
