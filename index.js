import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import postRouter from './routes/post.route.js';
import authRouter from './routes/auth.route.js';
import testRouter from './routes/test.route.js';
import userRouter from './routes/user.route.js';
import { verifyToken } from './middleware/verifyToken.js';
const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/posts', postRouter);
app.use('/api/auth', authRouter);
app.use('/api/test', verifyToken, testRouter);
app.use('/api/users', userRouter);

app.listen(8000, () => {
  console.log('server is running.>......');
});
