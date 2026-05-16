const jwt = require("jsonwebtoken");

// ── Xác thực token JWT ─────────────────────────────────────
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Bạn chưa đăng nhập" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};

// ── Yêu cầu quyền Admin hoặc Super Admin ─────────────────────
// Super Admin được phép làm mọi thứ Admin làm
const requireAdmin = (req, res, next) => {
  const role = req.user?.role;

  if (role !== "admin" && role !== "super_admin") {
    return res.status(403).json({ message: "Bạn không có quyền admin" });
  }

  next();
};

// ── Yêu cầu quyền Super Admin (chỉ super_admin) ──────────────
const requireSuperAdmin = (req, res, next) => {
  if (req.user?.role !== "super_admin") {
    return res
      .status(403)
      .json({ message: "Bạn không có quyền Super Admin" });
  }

  next();
};

module.exports = {
  verifyToken,
  requireAdmin,
  requireSuperAdmin,
};
