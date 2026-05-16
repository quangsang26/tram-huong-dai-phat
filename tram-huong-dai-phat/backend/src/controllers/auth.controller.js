const bcrypt = require("bcrypt");
const jwt    = require("jsonwebtoken");
const authRepository = require("../repositories/auth.repository");
const { sendOTPEmail } = require("../utils/email");

// ── Đăng ký ───────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { full_name, email, password, phone, address } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ họ tên, email và mật khẩu" });
    }

    const existing = await authRepository.findUserByEmail(email);
    if (existing) return res.status(409).json({ message: "Email đã tồn tại" });

    const hashed = await bcrypt.hash(password, 10);
    const user   = await authRepository.createUser({ full_name, email, password: hashed, phone, address });

    res.status(201).json({ message: "Đăng ký thành công", data: user });
  } catch (error) {
    console.error("Lỗi register:", error.message);
    res.status(500).json({ message: "Lỗi server khi đăng ký", error: error.message });
  }
};

// ── Đăng nhập ─────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu" });
    }

    const user = await authRepository.findUserByEmail(email);
    if (!user) return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });

    if (user.is_locked) {
      return res.status(403).json({ message: "Tài khoản đã bị khoá. Vui lòng liên hệ quản trị viên." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user.id, full_name: user.full_name, email: user.email,
        phone: user.phone, address: user.address, role: user.role,
      },
    });
  } catch (error) {
    console.error("Lỗi login:", error.message);
    res.status(500).json({ message: "Lỗi server khi đăng nhập", error: error.message });
  }
};

// ── Bước 1: Gửi OTP về email ──────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Vui lòng nhập email" });

    const user = await authRepository.findUserByEmail(email);

    // Luôn trả về thành công để không lộ email nào đã đăng ký
    if (!user) {
      return res.status(200).json({ message: "Nếu email tồn tại, mã OTP sẽ được gửi ngay." });
    }

    // Tạo OTP 4 chữ số ngẫu nhiên
    const otp = String(Math.floor(1000 + Math.random() * 9000));

    // Lưu OTP vào DB (hết hạn 15 phút)
    await authRepository.saveOTP(user.id, otp);

    // Gửi email
    await sendOTPEmail(user.email, user.full_name, otp);

    res.status(200).json({ message: "Mã OTP đã được gửi về email của bạn." });
  } catch (error) {
    console.error("Lỗi forgotPassword:", error.message);
    res.status(500).json({ message: "Lỗi server khi gửi email. Vui lòng thử lại sau." });
  }
};

// ── Bước 2: Xác nhận OTP ──────────────────────────────────
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Vui lòng nhập email và mã OTP" });
    }

    const record = await authRepository.findValidOTP(email, otp);

    if (!record) {
      return res.status(400).json({ message: "Mã OTP không đúng hoặc đã hết hạn" });
    }

    res.status(200).json({ message: "Mã OTP hợp lệ", valid: true });
  } catch (error) {
    console.error("Lỗi verifyOTP:", error.message);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// ── Bước 3: Đặt mật khẩu mới ─────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ message: "Thiếu thông tin" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const userId = await authRepository.resetPasswordByOTP(email, otp, hashed);

    if (!userId) {
      return res.status(400).json({ message: "Mã OTP không hợp lệ hoặc đã hết hạn" });
    }

    res.status(200).json({ message: "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay." });
  } catch (error) {
    console.error("Lỗi resetPassword:", error.message);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

module.exports = { register, login, forgotPassword, verifyOTP, resetPassword };