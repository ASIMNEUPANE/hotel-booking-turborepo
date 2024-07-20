import * as jwt from 'jsonwebtoken';
import { HttpException, HttpStatus } from '@nestjs/common';
export const generateJWT = (payload: object) => {
  console.log(jwt);
  return jwt.sign(
    {
      data: payload,
    },
    process.env.JWT_SECRET || '',
    { expiresIn: process.env.JWT_DURATION },
  );
};

export const verifyJWT = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    throw new HttpException('token is expire', HttpStatus.BAD_REQUEST);
  }
};
