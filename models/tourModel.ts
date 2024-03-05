import { Schema, Document, model, ObjectId } from "mongoose";
import slugify from "slugify";

export interface ITour extends Document {
  _id: string;
  name: string;
  rating: number;
  price: number;
  duration: number;
  maxGroupSize: number;
  difficulty: string;
  ratingsAverage: number;
  ratingsQuantity: number;
  priceDiscount: number;
  summary: string;
  description: string;
  imageCover: string;
  images: string[];
  startDates: [Date];
  slug: string;
  secretTour: boolean;
  startLocation: {
    type: string;
    coordinates: number[];
    address: string;
    description: string;
  };
  locations: {
    type: string;
    coordinates: number[];
    address: string;
    description: string;
    day: number;
  }[];
  guides: ObjectId[];
}

const TourSchema = new Schema<ITour>(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Tour must have a Name"],
      unique: true,
    },
    rating: {
      type: Number,
      default: 3,
      min: [1, "rating should be more the 1"],
      max: [5, "rating should be less the 5"],
    },
    price: {
      type: Number,
      required: [true, "Tour must have a Price"],
    },
    duration: { type: Number, required: true },
    maxGroupSize: { type: Number, required: true },
    difficulty: {
      type: String,
      enum: ["easy", "difficult", "medium"],
      default: "easy",
    },
    ratingsAverage: { type: Number, default: 4.1 },
    ratingsQuantity: { type: Number, default: 0 },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (this: ITour, val: number) {
          if (val < this.price) return true;
          return false;
        },
        message: "discount price less the actual price",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: true,
    },
    imageCover: { type: String, required: true },
    description: String,
    images: [String],
    startDates: [Date],
    slug: String,
    secretTour: { type: Boolean, default: false },
    startLocation: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

TourSchema.index({ price: 1 });

// document middleware
TourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Query middleware
TourSchema.pre("find", function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

// aggregation pipeline
TourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

// virtual schema
TourSchema.virtual("durationWeeks").get(function (this: ITour) {
  return this.duration / 7;
});

// virtual populate
TourSchema.virtual("review", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

export default model<ITour>("Tour", TourSchema);
