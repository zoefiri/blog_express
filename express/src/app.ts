import { PrismaClient } from '@prisma/client';
import Express from 'express';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app:Express.Express = express();
const prisma = new PrismaClient();

app.use(express.json());

import userRouter from './routes/user';
import postRouter from './routes/post';
import mediaRouter from './routes/media';
app.use('/user', userRouter);
app.use('/post', postRouter);
app.use('/media', mediaRouter);

app.listen(3000, () =>
  console.log('http://localhost:3000'),
);

export {app, prisma};
