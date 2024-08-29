import { createClient } from 'redis';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { issueJWT } from '../Config/jwt.js';

dotenv.config();

const redisClient = createClient();

redisClient.connect();

export async function register(req, res) {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: 'Missing required fields',
      });
    }

    const existingUser = await redisClient.hGetAll(email);

    if (Object.keys(existingUser).length > 0) {
      return res.status(409).json({
        message: 'User already exist with this email',
      });
    }

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hasedPassword = await bcrypt.hash(password, salt);

    const id = uuidv4();
    const data = await redisClient.hSet(email, {
      _id: id,
      fullName: fullName,
      email: email,
      password: hasedPassword,
      amount: 0,
    });

    const user = await redisClient.hGetAll(email);
    const tokenObject = issueJWT(data);

    return res.status(200).json({
      message: 'User Registered Succeessfully',
      token: tokenObject.token,
      expiresIn: tokenObject.expires,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        amount: user.amount,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error in setting values in redis',
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Missing required fields',
      });
    }

    const user = await redisClient.hGetAll(email);

    if (Object.keys(user).length === 0) {
      return res.status(401).json({
        message: 'Cannot find user with this email',
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        message: 'Invalid Password',
      });
    }

    const tokenObject = issueJWT(user);

    return res.status(200).json({
      message: 'Login Successfull',
      token: tokenObject.token,
      expiresIn: tokenObject.expires,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        amount: user.amount,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal Server Error (login)',
    });
  }
}

export async function addMoney(req, res) {
  try {
    const { money } = req.body;
    const key = req.body.email;

    const data = await redisClient.hSet(key, {
      amount: money,
    });

    return res.status(200).json({
      message: 'Money added successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal Server Error (add money)',
    });
  }
}
