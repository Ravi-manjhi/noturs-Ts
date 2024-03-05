import { Router } from "express";
import * as reviewController from "../controllers/reviewController";
import { protectMiddleware, restrictTo } from "../middlewares/auth";
import { GetOne } from "../controllers/handleFactory";

const router = Router({ mergeParams: true });

router.use(protectMiddleware);
router
  .route("/")
  .get(reviewController.getReviews)
  .post(restrictTo(["user", "admin"]), reviewController.createReview)
  .patch(restrictTo(["user", "admin"]), reviewController.updateReview);

router
  .route("/:id")
  .get(reviewController.getReviews)
  .delete(restrictTo(["user", "admin"]), reviewController.deleteReview);

export default router;
