import express from "express";
import {
  getUserById,
  getUserResumes,
  loginUser,
  registerUser,
  googleLoginUser,
  sendResetOtp,
  verifyOtp,
  resetPassword,
} from "../controller/userController.js";

import protect from "../middlewares/authMiddleware.js";

const userRouter = express.Router();

// ================= AUTH =================
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/google", googleLoginUser);

// ================= FORGOT PASSWORD =================
userRouter.post("/forgot", sendResetOtp);
userRouter.post("/verify-otp", verifyOtp);
userRouter.post("/reset-password", resetPassword);

// ================= PROTECTED ROUTES =================
userRouter.get("/data", protect, getUserById);
userRouter.get("/resumes", protect, getUserResumes);

export default userRouter;
