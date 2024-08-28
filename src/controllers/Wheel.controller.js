import { createClient } from 'redis';

const redisClient = createClient();

redisClient.connect();

const reels = [
  ['_', 'C', 'A', 'B'], // Reel 1
  ['B', '_', 'A', 'B'], // Reel 2
  ['A', 'C', '_', 'C'], // Reel 3
];

const payouts = {
  AAA: 60.8,
  AAC: 30.4,
  BBA: 20,
  BBC: 7.6,
  _BC: 7.6,
};

function spinReels() {
  return reels.map((reel) => {
    const randomIndex = Math.floor(Math.random() * reel.length);
    return reel[randomIndex];
  });
}

function calculatePayout(spinResult) {
  const resultString = spinResult.join('').toUpperCase();

  console.log('Spin Result:', spinResult);
  console.log('Result String:', `"${resultString}"`);

  if (payouts.hasOwnProperty(resultString)) {
    console.log(`Matched Payout: ${payouts[resultString]}`);
    return payouts[resultString];
  } else {
    console.log('No matching payout found.');
  }

  return 0;
}

export async function spinWheel(req, res) {
  const spinResult = spinReels();

  const payout = calculatePayout(spinResult);

  res.json({
    spinResult: spinResult.join(' | '),
    payout: payout > 0 ? payout : 'No win. Try again!',
  });
}
