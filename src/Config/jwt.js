import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import process from 'process';

dotenv.config();

export const issueJWT = (user) => {
  const id = user.id;
  const expiresIn = '24h';

  const payload = {
    sub: id,
    iat: Math.floor(Date.now / 1000),
  };

  const signedToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn,
  });
  return {
    token: `Bearer ${signedToken}`,
    expires: expiresIn,
  };
};
