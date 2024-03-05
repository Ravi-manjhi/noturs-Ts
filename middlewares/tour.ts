import { Request, Response, NextFunction } from 'express';

export const aliasTopTours = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.field = 'name,price,ratingsAverage,summary,difficulty';
  next();
};
