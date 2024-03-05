import jwt from "jsonwebtoken";
import z from "zod";

export const tourValidation = z.object({
  name: z.string(),
  rating: z.number().max(5).min(1).optional(),
  price: z.number(),
  duration: z.number(),
  maxGroupSize: z.number(),
  difficulty: z.string(),
  ratingsAverage: z.number().optional(),
  ratingsQuantity: z.number().optional(),
  priceDiscount: z.number().optional(),
  summary: z.string(),
  imageCover: z.string(),
  images: z.array(z.string()),
  startDates: z.array(z.string()),
});

export const tourUpdateValidation = z.object({
  name: z.string().min(4).optional(),
  rating: z.number().max(5).min(1).optional(),
  price: z.number().optional(),
});

export const validateSignIn = z.object({
  email: z.string().email(),
  password: z.string(),
});
export const createJWTToken = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: parseInt(process.env.JWT_EXPIRE_IN as string),
  });
