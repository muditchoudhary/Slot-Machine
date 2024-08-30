import express from 'express';
import { createClient } from 'redis';
import cors from 'cors';
import dotenv from 'dotenv';
import process from 'process';
import userRoutes from './routes/User.routes.js';
import wheelRoutes from './routes/Wheel.routes.js';
import adminRoutes from './routes/Admin.routes.js';

dotenv.config();
const redisClient = createClient();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const port = process.env.PORT || 5000;

app.use('/user', userRoutes);
app.use('/wheel', wheelRoutes);
app.use('/admin', adminRoutes);

redisClient.on('ready', () => {
  console.log('Redis Connected!');
});

redisClient.on('error', (err) => {
  console.log('Error in the Connection', err);
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, async () => {
  await redisClient.connect();
  console.log(`Server running on ${port}`);
});
