import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import postRouter from './routes/post.route.js';
import authRouter from './routes/auth.route.js';
import testRouter from './routes/test.route.js';
import userRouter from './routes/user.route.js';
import { verifyToken } from './middleware/verifyToken.js';
const app = express();

const allowedOrigins = [process.env.CLIENT_URL];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          'The CORS policy for this site does not allow access from the specified origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use('/api/posts', postRouter);
app.use('/api/auth', authRouter);
app.use('/api/test', verifyToken, testRouter);
app.use('/api/users', userRouter);

app.listen(8000, () => {
  console.log('server is running.>......');
});
