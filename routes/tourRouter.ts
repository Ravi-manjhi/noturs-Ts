import { Router } from "express";
import * as tourController from "../controllers/tourController";
import * as tour from "../middlewares/tour";
import * as auth from "../middlewares/auth";
import reviewRouter from "./reviewRouter";

const router = Router();

router.use("/:id/reviews", reviewRouter);

router.get("/top5-tours", tour.aliasTopTours, tourController.getTours);
router.get("/stats", tourController.getTourStats);
router.get("/plan", tourController.getMonthlyPlan);

router.use(auth.protectMiddleware);
router
  .route("/")
  .get(tourController.getTours)
  .post(auth.restrictTo(["admin", "lead-guide"]), tourController.createTour);

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(auth.restrictTo(["admin", "guide"]), tourController.updateTour)
  .delete(auth.restrictTo(["admin", "guide"]), tourController.deleteTour);

export default router;
