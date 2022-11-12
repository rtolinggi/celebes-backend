import express from 'express';
import { getDataAccountByNopol } from '../controllers/accountController';

const authRoute = express.Router();

authRoute.get('/:nopol', getDataAccountByNopol);

export default authRoute;
