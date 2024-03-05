import "dotenv/config";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";

// url not found handler
export const notFoundError = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  next(new AppError(`No APi URl found ${req.url}`, 404));
};

// catch async handler
export const catchAsync =
  (fn: (req: Request, res: Response, next: NextFunction) => any) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((err: Error) => next(err));
  };

// send err response
const sendResponse = (res: Response, err: any) => {
  res.status(err.statusCode).json({ status: err.status, message: err.message });
};

// global error handler
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  err.statusCode = err.statusCode || 500;
  err.status = `${err.statusCode}`.startsWith("4") ? "fail" : "error";

  if (process.env.NODE_ENV === "DEVELOPMENT") {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  }

  if (err.operational) {
    return sendResponse(res, err);
  }

  if (err.name === "CastError") {
    error.message = `invalid ${err.path}: ${err.value}`;
    error.statusCode = 400;
    return sendResponse(res, error);
  }

  if (err.name === "MongoServerError") {
    error.message = err.message;
    error.statusCode = 409;
    return sendResponse(res, error);
  }

  if (err.name === "ValidationError") {
    error.message = err.message;
    error.statusCode = 403;
    return sendResponse(res, error);
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    error.message = "token expire or invalid! try logging again";
    error.statusCode = 401;
    return sendResponse(res, error);
  }
  res.status(500).json({ status: "fail", message: "something wrong happen" });
};
