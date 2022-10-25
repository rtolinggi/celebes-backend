import express from "express";
import { signUp, verifiedEmail } from "../controllers/authController";

const authRoute = express.Router();

authRoute.post("/signup", signUp);
authRoute.get("/verified/:token", verifiedEmail);

export default authRoute;
