import type { Account } from '@prisma/client';
import { prisma } from '../database/prisma';

type result = {
  errors: Array<string>;
  data: Array<Account>;
};

export const GetAccount = async () => {
  try {
    const res = await prisma.account.findMany({
      orderBy: {
        costumerName: 'desc',
      },
    });
    return <result>{
      data: res,
      errors: [],
    };
  } catch (error) {
    return <result>{
      data: [],
      errors: [error],
    };
  }
};
