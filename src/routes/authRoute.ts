import express from 'express';
import {
  SignUp,
  SignIn,
  SignOut,
  GetUser,
  UpdateUser,
} from '../controllers/authController';

const authRoute = express.Router();

authRoute.post('/signup', SignUp);
authRoute.post('/signin', SignIn);
authRoute.delete('/signout', SignOut);
authRoute.get('/', GetUser);
authRoute.put('/:id', UpdateUser);

export default authRoute;
