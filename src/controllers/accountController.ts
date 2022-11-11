import type { Request, Response } from 'express';
import type { ResponseJson } from '../helpers/types';
import { GetAccount } from '../models/account';

export const getDataAccount = async (req: Request, res: Response) => {
  let resJson: ResponseJson;
  const { data, errors } = await GetAccount();
  if (errors.length !== 0) {
    resJson = {
      code: 500,
      status: 'internal server error',
      data: [],
      errors,
    };
    return res.status(500).json(resJson);
  }

  resJson = {
    code: 200,
    status: 'OK',
    errors: [],
    data,
  };
  return res.status(200).json(resJson);
};
