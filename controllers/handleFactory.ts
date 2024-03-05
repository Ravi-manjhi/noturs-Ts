import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../middlewares/error";
import { AppError } from "../utils/AppError";

export const DeleteOne = (Model: any) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id || req.params.tourId;

    const doc = await Model.findByIdAndDelete(id);

    if (!doc) return next(new AppError("No Document found with that Id", 400));

    res.status(204).json({ status: "success" });
  });

export const UpdateOne = (Model: any) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const body = req.body;

    const doc = await Model.findByIdAndUpdate(id, body);
    if (!doc) return next(new AppError("No Document found with this Id", 404));

    res.status(200).json({ status: "success", data: doc });
  });

export const GetOne = (Model: any, popOptions?: any) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    let query = Model.findById(id);
    if (!query)
      return next(new AppError("No Document found with this Id", 404));

    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    res.status(200).json({ status: "success", data: doc });
  });
