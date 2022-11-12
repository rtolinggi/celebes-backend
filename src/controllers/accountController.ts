import type { Request, Response } from 'express';
import type { ResponseJson } from '../helpers/types';
import { GetAccountByNopol } from '../models/account';

export const getDataAccountByNopol = async (req: Request, res: Response) => {
  let resJson: ResponseJson;
  let nopol = req.params.nopol;
  console.log(nopol);
  const { data, errors } = await GetAccountByNopol(nopol);
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
