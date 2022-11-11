import 'dotenv/config';
import express, { type Response, type Request } from 'express';
import cors, { type CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import { PORT } from './configs/constant';
import authRoute from './routes/authRoute';
import accountRoute from './routes/accountRoute';

const whiteList = ['http://localhost:3000'];
const corsOptions: CorsOptions = {
  origin(requestOrigin, callback) {
    if (whiteList.indexOf(String(requestOrigin)) !== -1 || !requestOrigin) {
      callback(null, true);
    } else {
      callback(new Error('Not Allowed By Cors'));
    }
  },
  credentials: true,
  exposedHeaders: ['token'],
};

const port = PORT || 3000;
const app = express();

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/auth', authRoute);
app.use('/api/account', accountRoute);

app.listen(port, () => {
  console.log(`server running on port : ${port}`);
});
