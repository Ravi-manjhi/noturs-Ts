import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../middlewares/error";
import reviewModel from "../models/reviewModel";
import { DeleteOne, GetOne, UpdateOne } from "./handleFactory";

export const createReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id: userId } = req.user;
    const { id } = req.params;
    const { review, rating } = req.body;

    const newReview = await reviewModel.create({
      user: userId,
      tour: id,
      review,
      rating,
    });

    res.status(201).json({
      status: "success",
      message: "Review created",
      review: newReview,
    });
  }
);

export const getReviews = GetOne(reviewModel);
export const deleteReview = DeleteOne(reviewModel);
export const updateReview = UpdateOne(reviewModel);
