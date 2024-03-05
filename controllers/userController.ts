import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendMail from "../utils/email";
import userModel from "../models/userModel";
import { Request, Response, NextFunction, request } from "express";
import { catchAsync } from "../middlewares/error";
import { AppError } from "../utils/AppError";
import { validateSignIn } from "../validation/tourValidation";
import { APIFeatures } from "../utils/APIFeatures";
import { DeleteOne, GetOne, UpdateOne } from "./handleFactory";

const COOKIE_EXPIRE = parseInt(process.env.JWT_COOKIE_EXPIRE as string);
const createSendToken = (id: string, res: Response, statusCode: number) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });

  res.cookie("jwt", token, {
    expires: new Date(Date.now() + COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    secure: process.env.NODE_ENV === "PRODUCTION",
    httpOnly: true,
  });

  res.status(statusCode).json({
    status: "success",
  });
};

// authentication
export const signUp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { firstName, lastName, email, password, confirmPassword, photo } =
      req.body;

    const newUser = await userModel.create({
      firstName,
      lastName,
      email,
      password,
      photo,
      confirmPassword,
    });

    createSendToken(newUser._id, res, 201);
  }
);

export const signIn = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const validate = validateSignIn.safeParse(req.body);

    if (!validate.success)
      return next(
        new AppError("Please provide email or password correct", 400)
      );

    const user = await userModel.findOne({ email }).select("+password");

    if (!user || !(await user?.correctPassword(password)))
      return next(new AppError("Incorrect Email or Password", 401));

    createSendToken(user._id, res, 200);
  }
);

export const updatePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.user;

    const { currentPassword, password, confirmPassword } = req.body;

    const user = await userModel.findById(id).select("+password");

    if (!user || !(await user.correctPassword(currentPassword))) {
      return next(new AppError("Your current Password is wrong", 400));
    }

    user.password = password;
    user.confirmPassword = confirmPassword;

    user.save({ validateBeforeSave: true });

    res.status(200).json({ status: "success", message: "password is changed" });
  }
);

export const forgetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) return next(new AppError("No User found", 404));

    const resetToken = await user.createPasswordResetToken();

    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/auth/resetPassword/${resetToken}`;

    const message = `forget your password? submit a patch request with your new password and password confirm to: ${resetUrl}.\nIf you did't forget your password, please ignore this message`;

    try {
      await sendMail({
        email: "ravi.manjhi199@gmail.com",
        message,
        subject: "reset Password! valid for 10 minute",
      });
    } catch (error) {
      user.passwordResetExpires = undefined;
      user.passwordResetToken = undefined;

      await user.save({ validateBeforeSave: false });
      throw error;
    }

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: "success",
      message: "reset link send your email address",
    });
  }
);

export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params;
    const decode = crypto.createHash("sha256").update(token).digest("hex");

    const user = await userModel.findOne({
      passwordResetToken: decode,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) return next(new AppError("token is expire or invalid", 400));

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: true });

    createSendToken(user._id, res, 200);
  }
);

// user controller
export const getUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.user;

    const doc = await userModel.findById(id);
    res.status(200).json({ status: "success", data: doc });
  }
);

export const updateMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.user;
    const { firstName, lastName, photo, email } = req.body;

    await userModel.findByIdAndUpdate(id, {
      firstName,
      lastName,
      photo,
      email,
    });

    res.status(200).json({ status: "success" });
  }
);

export const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const feature = new APIFeatures(userModel.find(), req.query)
      .filter()
      .sort()
      .fields()
      .pagination();

    const user = await feature.query;

    res.status(200).json({
      status: "success",
      result: user.length,
      data: user,
    });
  }
);

export const deleteMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.user;

    await userModel.findByIdAndUpdate(id, { active: false });

    res.status(20).json({ status: "success", message: "Account deleted" });
  }
);

export const getMe = GetOne(userModel);
export const deleteUser = DeleteOne(userModel);
export const updateUser = UpdateOne(userModel);
