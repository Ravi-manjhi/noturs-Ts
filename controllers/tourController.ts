import * as validator from "../validation/tourValidation";
import tourModel from "../models/tourModel";
import userModel from "../models/userModel";
import { NextFunction, Request, Response, query } from "express";
import { APIFeatures } from "../utils/APIFeatures";
import { catchAsync } from "../middlewares/error";
import { AppError } from "../utils/AppError";
import { DeleteOne, UpdateOne } from "./handleFactory";

export const getTours = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const feature = new APIFeatures(tourModel.find(), req.query)
      .filter()
      .sort()
      .fields()
      .pagination();

    const tours = await feature?.query
      .populate({
        path: "guides",
        model: userModel,
        select: "-passwordChangeAt -__v -createdAt -updatedAt",
      })
      .explain();
    res.status(200).json({ status: "success", result: tours.length, tours });
  }
);

export const createTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    const validate = validator.tourValidation.safeParse(body);

    if (!validate.success) {
      return next(new AppError("wrong input", 402));
    }

    const response = new tourModel(body);

    const newTour = await response.save();
    res.status(201).json({ status: "success", tour: newTour });
  }
);

export const getTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const tour = await tourModel
      .findById(id)
      .populate({
        path: "guides",
        model: userModel,
        select: "-passwordChangeAt -__v -createdAt -updatedAt",
      })
      .populate({ path: "review" });

    if (!tour) return next(new AppError("No tour found this id", 404));

    res.status(200).json({ status: "success", tour });
  }
);

export const updateTour = UpdateOne(tourModel);
export const deleteTour = DeleteOne(tourModel);

export const getTourStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const stats = await tourModel.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: "$difficulty" },
          num: { $sum: 1 },
          numRatings: { $sum: "$ratingsQuantity" },
          avgRating: { $avg: "$ratingsAverage" },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
    ]);

    res.status(200).json({ stats: "success", data: stats });
  }
);

export const getMonthlyPlan = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const year = parseInt(req.params.year);

    const stats = await tourModel.aggregate([
      {
        $unwind: "$startDates",
      },
      {
        $match: {
          startDates: {
            $gte: new Date("2021-01-01"),
            $lte: new Date("2021-12-31"),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$startDates" },
          numTourStats: { $sum: 1 },
          tours: {
            $push: "$name",
          },
        },
      },
      {
        $addFields: { month: "$_id" },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: {
          numTourStats: -1,
        },
      },
      {
        $limit: 12,
      },
    ]);

    res.status(200).json({ stats: "success", data: stats });
  }
);
