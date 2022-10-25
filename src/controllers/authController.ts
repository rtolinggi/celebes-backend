import type { Request, Response } from "express";
import type { ResponseJson } from "../helpers/types";
import { prisma } from "../database/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { User } from "@prisma/client";
import createTransporter, { bodyEmail } from "../helpers/email";
import crypto from "crypto";

const UserSchema = z
  .object({
    email: z
      .string({ required_error: "email is required" })
      .email({ message: "invalid email address" }),
    passwordHash: z
      .string({ required_error: "password is required" })
      .min(6, { message: "password must be 6 or more characters long " }),
    confirmPassword: z.string({
      required_error: "confirm password is required",
    }),
  })
  .refine((data) => data.passwordHash === data.confirmPassword, {
    message: "Password not match",
    path: ["confirmPassword"],
  });

type ActionInput = z.infer<typeof UserSchema>;

export const signUp = async (req: Request, res: Response) => {
  const body: ActionInput = await req.body;
  let resJson: ResponseJson;

  try {
    await UserSchema.parseAsync(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      resJson = {
        code: 400,
        status: "Bad Request",
        data: [],
        errors: error.errors.map((msg) => msg.message),
      };
      return res.status(400).json(resJson);
    }
  }

  const checkUserExist = await prisma.user.findUnique({
    where: {
      email: body.email,
    },
  });

  if (checkUserExist) {
    resJson = {
      code: 409,
      status: "Conflict",
      data: [],
      errors: ["Email Already Exist"],
    };
    return res.status(409).json(resJson);
  }

  const salt = await bcrypt.genSalt(10);
  body.passwordHash = await bcrypt.hash(body.passwordHash, salt);

  let userCreate: User;
  let token: string;
  try {
    token = crypto.randomBytes(32).toString("hex");
    userCreate = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash: body.passwordHash,
        VerifiedEmail: {
          create: {
            token,
          },
        },
      },
    });
  } catch (error) {
    resJson = {
      code: 500,
      status: "Internal Server Error",
      data: [],
      errors: ["Internal Server Error Please Contact Administrator"],
    };
    return res.status(500).json(resJson);
  }

  createTransporter(
    body.email,
    "Verification User",
    bodyEmail(`http://localhost:3000/auth/verified/${token}`)
  );

  resJson = {
    code: 201,
    status: "Created",
    data: [userCreate],
    errors: [],
  };
  return res.json(resJson);
};

export const verifiedEmail = async (req: Request, res: Response) => {
  let resJson: ResponseJson;
  const token = req.params.token;
  const idEmail = await prisma.verifiedEmail.findFirst({ where: { token } });

  if (!idEmail) {
    resJson = {
      code: 404,
      status: "Not Found",
      data: [],
      errors: ["Invalid Token"],
    };
    return res.status(404).json(resJson);
  }

  try {
    await prisma.user.update({
      where: {
        id: idEmail.userId,
      },
      data: {
        isVerified: true,
      },
    });
  } catch (error) {
    resJson = {
      code: 500,
      status: "Internal Server Error",
      data: [],
      errors: ["Something wrong Internal Server Error"],
    };
  }

  resJson = {
    code: 200,
    status: "OK",
    data: [{ message: "Validate User Email is Success" }],
    errors: [],
  };
  res.status(200).json(resJson);
};
