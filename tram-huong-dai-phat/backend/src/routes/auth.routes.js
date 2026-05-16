const express = require("express");
const router  = express.Router();
const authController = require("../controllers/auth.controller");
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau 15 phút." },
  skipSuccessfulRequests: true,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: "Bạn đã tạo quá nhiều tài khoản. Vui lòng thử lại sau." },
});

// Giới hạn gửi OTP: 3 lần / 15 phút
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { message: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút." },
});

router.post("/auth/register", registerLimiter, authController.register);
router.post("/auth/login", loginLimiter, authController.login);

// OTP flow
router.post("/auth/forgot-password", otpLimiter, authController.forgotPassword);  // Bước 1: gửi OTP
router.post("/auth/verify-otp", authController.verifyOTP);                         // Bước 2: xác nhận OTP
router.post("/auth/reset-password", authController.resetPassword);                  // Bước 3: đặt mật khẩu mới

module.exports = router;