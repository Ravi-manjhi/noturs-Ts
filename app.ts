import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

import { rateLimit } from "express-rate-limit";
import "dotenv/config";

import tourRouter from "./routes/tourRouter";
import userRouter from "./routes/userRouter";
import reviewRouter from "./routes/reviewRouter";
import { globalErrorHandler, notFoundError } from "./middlewares/error";

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(
  rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: "To many request from this IP, please try again after a hours",
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// routers

app.use("/tours", tourRouter);
app.use("/user", userRouter);
app.use("/review", reviewRouter);

// Error handler router
app.all("*", notFoundError);
app.use(globalErrorHandler);

export default app;
