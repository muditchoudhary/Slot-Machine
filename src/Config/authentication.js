import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const authentication = (req, res, next) => {
  const authHeaders = req.headers;

  if (!authHeaders.authorization) {
    return res.status(401).json({
      status: 'Fail',
      message: 'Unauthorized : No authorization header provided',
    });
  }

  if (!authHeaders.authorization.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'fail',
      message: 'Unauthorized: Invalid token format',
    });
  }

  const token = authHeaders.authorization.split(' ')[1];

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'Fail',
      message: 'Unauthorized : Invalid token',
    });
  }
};
