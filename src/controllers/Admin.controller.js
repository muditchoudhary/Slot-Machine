import { createClient } from 'redis';
import { issueJWT } from '../Config/jwt.js';

const redisClient = createClient();

redisClient.connect();

function calculateProfit(totalBetAmount, totalPayout) {
  let totalProfit = totalBetAmount - totalPayout;
  return totalProfit;
}

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

    console.log(typeof result);
    // Initialize total variables
    let totalBetAmount = 0;
    let totalPayout = 0;

    // Loop through the result array
    for (let item of result) {
      const betAmount = parseFloat(item.value.betAmount) || 0;
      const payout = parseFloat(item.value.payout) || 0;

      totalBetAmount += betAmount;
      totalPayout += payout;
    }
    const totalProfit = calculateProfit(totalBetAmount, totalPayout);

    res.status(200).json({
      message: 'Users fetched',
      users: result,
      totalBet: totalBetAmount,
      totalPayout: totalPayout,
      profit: totalProfit,
    });
  } catch (error) {
    res.status(500).send('Internal Server Error (userList)');
  }
}
