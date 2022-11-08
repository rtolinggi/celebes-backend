import { prisma } from '../database/prisma';
import { User } from '@prisma/client';
import { ActionInputUser, ActionUpdateUser } from '../helpers/schema';
import bcrypt from 'bcryptjs';

type result = {
  errors: Array<string>;
  data: Array<User>;
};

// Get All User
export const GetUsers = async () => {
  try {
    const user = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return <result>{
      data: user,
      errors: [],
    };
  } catch (error) {
    return <result>{
      data: [],
      errors: [error],
    };
  }
};

// Get User By Id
export const GetUser = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    return <result>{
      data: [user],
      errors: [],
    };
  } catch (error) {
    return <result>{
      data: [],
      errors: [error],
    };
  }
};

// Get User By Email
export const GetUserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    return <result>{
      data: [user],
      errors: [],
    };
  } catch (error) {
    return <result>{
      data: [],
      errors: ['Internal Server Error'],
    };
  }
};
// Create User
export const CreateUser = async (body: ActionInputUser, token: string) => {
  try {
    const salt = await bcrypt.genSalt(10);
    body.passwordHash = await bcrypt.hash(body.passwordHash, salt);

    const user = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash: body.passwordHash,
        role: body.role,
        VerifiedEmail: {
          create: {
            token,
          },
        },
      },
    });

    return <result>{
      errors: [],
      data: [user],
    };
  } catch (error) {
    return <result>{
      errors: ['Internal Server Error'],
      data: [],
    };
  }
};

// Update User
export const UpdateUserById = async (body: ActionUpdateUser) => {
  try {
    const user = await prisma.user.update({
      data: {
        role: body.role,
        isActive: body.isActive,
      },
      where: {
        id: body.id,
      },
    });

    return <result>{
      errors: [],
      data: [user],
    };
  } catch (error) {
    return <result>{
      errors: ['Internal Server Error'],
      data: [],
    };
  }
};

// Delete User
export const DeleteUser = (id: string) => {};
