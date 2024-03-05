import { Schema, Document, model, Model, Types } from "mongoose";
import tourModel from "./tourModel";

interface IReview extends Document {
  review: string;
  rating: number;
  tour: Types.ObjectId;
  user: Types.ObjectId;
  calcAverageRatings(tourId: Types.ObjectId): Promise<void>;
}

const ReviewSchema = new Schema<IReview>(
  {
    review: { type: String, required: [true, "Review field is required"] },
    rating: { type: Number, max: 5, min: 1, default: 1 },
    tour: {
      type: Schema.Types.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to Tour"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review must belong to User"],
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

ReviewSchema.index({ user: 1, tour: 1 }, { unique: true });

ReviewSchema.pre<IReview>("find", function (next) {
  this.populate({
    path: "user",
    select: "-__v -createdAt -updatedAt -passwordChangeAt -email",
  });

  next();
});

ReviewSchema.statics.calcAverageRatings = async function (
  this: Model<IReview>,
  tourId: Types.ObjectId
) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await tourModel.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  }
};

ReviewSchema.post("save", async function (doc: any) {
  await doc.constructor.calcAverageRatings(doc.tour);
});

ReviewSchema.post(/^findOneAnd/, async function (doc: any) {
  await doc.constructor.calcAverageRatings(doc.tour);
});

export default model<IReview>("Review", ReviewSchema);
