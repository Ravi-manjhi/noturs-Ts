import { Router } from "express";
import * as userController from "../controllers/userController";
import * as auth from "../middlewares/auth";

const router = Router();

router.post("/signup", userController.signUp);
router.post("/signin", userController.signIn);
router.post("/forgetPassword", userController.forgetPassword);
router.patch("/resetPassword/:token", userController.resetPassword);

//  protected middleware
router.use(auth.protectMiddleware);
router.patch("/changePassword", userController.updatePassword);
router.get("/me", userController.getUser);

router.use(auth.restrictTo(["admin"]));
router
  .route("/")
  .get(userController.getAllUsers)
  .patch(userController.updateMe)
  .delete(userController.deleteMe);

router
  .route("/:id")
  .get(userController.getMe)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

export default router;
