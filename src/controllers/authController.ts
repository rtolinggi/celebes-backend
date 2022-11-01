import type { Request, Response } from 'express';
import type { ResponseJson } from '../helpers/types';
import createTransporter, { bodyEmail } from '../helpers/email';
import { CreateUser, GetUserByEmail } from '../models/user';
import { Validate } from '../helpers/validate';
import { ActionInputUser, UserSchema } from '../helpers/schema';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sign } from 'jsonwebtoken';
import {
  JWT_SECRET_ACCESS_TOKEN,
  JWT_SECRET_REFRESH_TOKEN,
} from '../configs/constant';
import { prisma } from '../database/prisma';

export const SignIn = async (req: Request, res: Response) => {
  const body: ActionInputUser = req.body;
  let resJson: ResponseJson;

  body.confirmPassword = body.passwordHash;
  const validation = await Validate(UserSchema, body);
  if (validation) {
    resJson = {
      code: 400,
      status: 'Bad Request',
      data: [],
      errors: validation,
    };
    return res.status(400).json(resJson);
  }

  const { data } = await GetUserByEmail(body.email);

  if (!data[0]) {
    resJson = {
      code: 404,
      status: 'Not Found',
      data: [],
      errors: ['Email atau Password tidak cocok'],
    };
    return res.status(404).json(resJson);
  }

  if (!data[0].isVerified) {
    resJson = {
      code: 401,
      status: 'Unautorized',
      data: [],
      errors: [
        'Email belum di verifikasi, silahkan verifikasi email terlebih dahulu',
      ],
    };
    return res.status(401).json(resJson);
  }

  if (!data[0].isActive) {
    resJson = {
      code: 401,
      status: 'Unautorized',
      data: [],
      errors: ['Account belum Aktif, hubungi admin untuk aktifasi Account'],
    };
    return res.status(401).json(resJson);
  }

  const checkPassword = await bcrypt.compare(
    body.passwordHash,
    data[0].passwordHash,
  );

  if (!checkPassword) {
    resJson = {
      code: 404,
      status: 'Not Found',
      data: [],
      errors: ['Email atau Password tidak cocok'],
    };
    return res.status(404).json(resJson);
  }

  const refreshToken = sign(
    {
      id: data[0].id,
      email: data[0].email,
      role: data[0].role,
    },
    String(JWT_SECRET_REFRESH_TOKEN),
    {
      expiresIn: '30d',
    },
  );

  const accessToken = sign(
    {
      id: data[0].id,
      email: data[0].email,
      role: data[0].role,
    },
    String(JWT_SECRET_ACCESS_TOKEN),
    {
      expiresIn: '1h',
    },
  );

  const newData = await prisma.user.update({
    where: {
      email: body.email,
    },
    data: {
      refreshToken,
    },
  });

  resJson = {
    code: 200,
    status: 'OK',
    data: [
      {
        id: newData.id,
        email: newData.email,
        role: newData.role,
        accessToken,
        refreshToken,
      },
    ],
    errors: [],
  };
  return res
    .cookie('token', refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
      // secure: true,
    })
    .status(200)
    .json(resJson);
};

export const SignUp = async (req: Request, res: Response) => {
  const body: ActionInputUser = await req.body;
  let resJson: ResponseJson;

  const validation = await Validate(UserSchema, body);
  if (validation) {
    resJson = {
      code: 400,
      status: 'Bad Request',
      data: [],
      errors: validation,
    };
    return res.status(400).json(resJson);
  }

  const checkUserAlreadyExist = await GetUserByEmail(body.email);
  if (checkUserAlreadyExist.data[0]) {
    resJson = {
      code: 409,
      status: 'Conflict',
      data: [],
      errors: [
        'Email sudah terdaftar, silahkan masuk dengan menggunakan email ini',
      ],
    };
    return res.status(409).json(resJson);
  }

  const token = crypto.randomBytes(32).toString('hex');
  const { data, errors } = await CreateUser(body, token);
  if (errors?.length !== 0) {
    resJson = {
      code: 500,
      status: 'Internal Server Error',
      data: [],
      errors: ['gagal menyimpan data, server bermasalah'],
    };
  }

  createTransporter(
    body.email,
    'Verification User',
    bodyEmail(`http://localhost:3000/auth/verified/${token}`),
  );

  if (data) {
    resJson = {
      code: 201,
      status: 'Created',
      data: data,
      errors: [],
    };

    return res.json(resJson);
  }
};

export const SignOut = async (req: Request, res: Response) => {
  let resJson: ResponseJson;
  const token = req.cookies?.token;

  if (!token) {
    resJson = {
      code: 401,
      status: 'Unautorized',
      data: [],
      errors: ['Token tidak boleh kosong'],
    };
    return res.status(401).json(resJson);
  }

  const user = await prisma.user.findFirst({
    where: {
      refreshToken: token,
    },
  });
  if (!user) {
    resJson = {
      code: 401,
      status: 'Unautorized',
      data: [],
      errors: ['Token tidak valid'],
    };
  }

  try {
    await prisma.user.update({
      where: {
        id: user?.id,
      },
      data: {
        refreshToken: '',
      },
    });
    resJson = {
      code: 200,
      status: 'OK',
      data: [{ message: 'Sukses keluar aplikasi' }],
      errors: [],
    };
    return res.clearCookie('token', { path: '/' }).status(200).json(resJson);
  } catch (error) {
    resJson = {
      code: 500,
      status: 'Internal Server Error',
      data: [],
      errors: ['Server error'],
    };
    return res.status(500).json(resJson);
  }
};

//   export const verifiedEmail = async (req: Request, res: Response) => {
//     let resJson: ResponseJson;
//     const token = req.params.token;
//     const idEmail = await prisma.verifiedEmail.findFirst({ where: { token } });

//     if (!idEmail) {
//       resJson = {
//         code: 404,
//         status: "Not Found",
//         data: [],
//         errors: ["Invalid Token"],
//       };
//       return res.status(404).json(resJson);
//     }

//     try {
//       await prisma.user.update({
//         where: {
//           id: idEmail.userId,
//         },
//         data: {
//           isVerified: true,
//         },
//       });
//     } catch (error) {
//       resJson = {
//         code: 500,
//         status: "Internal Server Error",
//         data: [],
//         errors: ["Something wrong Internal Server Error"],
//       };
//     }

//     resJson = {
//       code: 200,
//       status: "OK",
//       data: [{ message: "Validate User Email is Success" }],
//       errors: [],
//     };
//     res.status(200).json(resJson);
//   };
// };
