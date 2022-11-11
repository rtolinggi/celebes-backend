import express from 'express';
import { getDataAccount } from '../controllers/accountController';

const authRoute = express.Router();

authRoute.get('/', getDataAccount);

export default authRoute;
