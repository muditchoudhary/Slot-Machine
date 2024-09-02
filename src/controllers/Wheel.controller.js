import { parse } from 'dotenv';
import { createClient } from 'redis';

const redisClient = createClient();

redisClient.connect();

const reels = [
  ['_', 'C', 'A', 'B'], // Reel 1
  ['B', '_', 'A', 'B'], // Reel 2
  ['A', 'C', '_', 'C'], // Reel 3
];

function payouts(resultString, betAmount) {
  //RTP = 90%
  //Winning combinations:- AAA(1), BBA(2), BBC(4)
  let totalWin;
  switch (resultString) {
    // totalwin = (1 / (% of occurence of symbol in ree 1 x % of occurence of symbol in ree 2 x % of occurence of symbol in ree 3)) x 0.90 x $betAmount
    case 'AAA':
      totalWin = 64 * betAmount * 0.9;
      break;
    case 'BBA':
      totalWin = 32 * betAmount * 0.9;
      break;
    case 'BBC':
      totalWin = 16 * betAmount * 0.9;
      break;
    default:
      totalWin = 0;
      break;
  }
  return totalWin;
}

function spinReels() {
  return reels.map((reel) => {
    const randomIndex = Math.floor(Math.random() * reel.length);
    return reel[randomIndex];
  });
}

function calculatePayout(spinResult, betAmount) {
  const resultString = spinResult.join('').toUpperCase();

  console.log('Spin Result:', spinResult);
  console.log('Result String:', `"${resultString}"`);
  let winAmount = payouts(resultString, betAmount);
  return winAmount;
}

function isDecimal(value) {
  return value % 1 !== 0;
}

export async function spinWheel(req, res) {
  try {
    let { email, betAmount } = req.body;
    let user = await redisClient.hGetAll(email);

    let currentAmount = user.amount;
    let currentBetAmount = user.betAmount;
    let currentWinBet = user.winBet;
    let currentPayout = user.payout;
    let currentLooseBet = user.looseBet;

    betAmount = parseFloat(betAmount);
    currentAmount = parseFloat(currentAmount);
    currentBetAmount = parseFloat(currentBetAmount);
    currentWinBet = parseFloat(currentWinBet);
    currentPayout = parseFloat(currentPayout);
    currentLooseBet = parseFloat(currentLooseBet);

    if (isNaN(currentAmount) || isNaN(betAmount))
      return res.status(400).json({
        message: 'Invalid amount currentAmount or betAmount',
      });

    if (betAmount == 0 || isDecimal(betAmount))
      return res.status(400).json({
        message: 'Bet Amount Cannot be zero or decimal',
      });

    if (currentAmount < betAmount)
      return res.status(400).json({
        message: 'Insufficient balance',
      });

    const amount = (currentAmount -= betAmount);
    let newBetAmount = (currentBetAmount += betAmount);

    const spinResult = spinReels();

    const payout = calculatePayout(spinResult, betAmount);

    if (payout > 0) {
      let newAmount = amount + payout;
      let totalPayout = currentPayout + payout;
      let totalWinBet = currentWinBet + betAmount;

      await redisClient.hSet(email, {
        amount: newAmount,
        betAmount: newBetAmount,
        winBet: totalWinBet,
        payout: totalPayout,
      });

      return res.status(200).json({
        spinResult: spinResult.join(' | '),
        payout: payout > 0 ? payout : 'No win. Try again!',
        balance: newAmount,
      });
    } else {
      let newAmount = amount + payout;
      let totalLooseBet = currentLooseBet + betAmount;

      await redisClient.hSet(email, {
        amount: newAmount,
        betAmount: newBetAmount,
        looseBet: totalLooseBet,
      });

      return res.status(200).json({
        spinResult: spinResult.join(' | '),
        payout: payout > 0 ? payout : 'No win. Try again!',
        balance: newAmount,
      });
    }

    // if (payout !== undefined || payout !== null) {
    //   let newAmount = amount + payout;

    //   await redisClient.hSet(email, {
    //     amount: newAmount,
    //     betAmount: newBetAmount,
    //   });

    //   return res.status(200).json({
    //     spinResult: spinResult.join(' | '),
    //     payout: payout > 0 ? payout : 'No win. Try again!',
    //     balance: newAmount,
    //   });
    // } else {
    //   return res.status(500).json({
    //     message: 'Error calculating payout',
    //   });
    // }
  } catch (error) {
    res.status(500).json({
      message: 'Internal Server Error',
    });
  }
}
