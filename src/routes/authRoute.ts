import express from "express";
import { SignUp, SignIn, SignOut } from "../controllers/authController";

const authRoute = express.Router();

authRoute.post("/signup", SignUp);
authRoute.post("/signin", SignIn);
authRoute.delete("/signout", SignOut);

export default authRoute;
