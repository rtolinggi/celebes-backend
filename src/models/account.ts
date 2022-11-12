import type { Account } from '@prisma/client';
import { prisma } from '../database/prisma';

type result = {
  errors: Array<string>;
  data: Array<Account>;
};

export const GetAccountByNopol = async (id: string) => {
  try {
    const res = await prisma.account.findFirst({
      where: {
        numPolice: id,
      },
    });
    return <result>{
      errors: [],
      data: [res],
    };
  } catch (error) {
    return <result>{
      data: [],
      errors: [error],
    };
  }
};
