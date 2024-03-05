import { Request, Response, NextFunction } from "express";
import { catchAsync } from "./error";
import { AppError } from "../utils/AppError";

import jwt from "jsonwebtoken";
import userModel from "../models/userModel";

declare global {
  namespace Express {
    interface Request {
      user: any;
    }
  }
}

interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

export const protectMiddleware = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // let token;
    // if (
    //   req.headers.authorization &&
    //   req.headers.authorization.startsWith("Bearer")
    // ) {
    //   token = req.headers.authorization.split(" ")[1];
    // }
    const token = req.cookies.jwt;
    if (!token) return next(new AppError("logging to continue", 401));

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    const { id, iat } = decoded;

    const user = await userModel.findById(id).select("+role");
    if (!user)
      return next(
        new AppError(
          "This user are not belong to this token! try login again",
          401
        )
      );

    if (await user.isPasswordChanged(iat))
      return next(new AppError("Password changed! Please login", 401));

    req.user = user;
    next();
  }
);

export const restrictTo = (roles: string[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You don't have a permission to perform this task", 401)
      );
    }

    next();
  });
};
