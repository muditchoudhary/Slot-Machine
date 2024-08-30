import { createClient } from 'redis';
import { issueJWT } from '../Config/jwt.js';

const redisClient = createClient();

redisClient.connect();

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Missing required fields',
      });
    }
    let adminEmail = 'admin@gmail.com';
    let adminPassword = '12345678';

    if (email === adminEmail && password === adminPassword) {
      const user = {
        fullName: 'Admin',
        email: adminEmail,
      };
      const tokenObject = issueJWT(user);

      return res.status(200).json({
        message: 'Login Successfull',
        token: tokenObject.token,
        expiresIn: tokenObject.expires,
        user: {
          fullName: user.fullName,
          email: user.email,
        },
      });
    } else {
      res.json({ message: 'Invalid Email or Password' });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Internal Server Error (Admin login)',
    });
  }
}

export async function userList(req, res) {
  try {
    const keys = await redisClient.KEYS('*');
    const allUser = [];

    for (const key of keys) {
      const values = await redisClient.hGetAll(key);
      allUser.push({ value: values });
    }

    const result = JSON.parse(JSON.stringify(allUser));

    res.status(200).json({
      message: 'Users fetched',
      users: result,
    });
  } catch (error) {
    res.status(500).send('Internal Server Error (userList)');
  }
}
