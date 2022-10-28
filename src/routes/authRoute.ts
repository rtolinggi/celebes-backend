import express from "express";
import { SignUp, SignIn } from "../controllers/authController";

const authRoute = express.Router();

authRoute.post("/signup", SignUp);
authRoute.post("/signin", SignIn);

export default authRoute;
