const express = require("express");
const router = express.Router();
const superadminController = require("../controllers/superadmin.controller");
const {
  verifyToken,
  requireSuperAdmin,
} = require("../middlewares/auth.middleware");

// Tất cả routes bên dưới đều yêu cầu đăng nhập + quyền super_admin
const guard = [verifyToken, requireSuperAdmin];

// ── Quản lý tài khoản Admin ───────────────────────────────────
router.get("/super-admin/admins", ...guard, superadminController.getAdmins);
router.post("/super-admin/admins", ...guard, superadminController.createAdmin);
router.patch("/super-admin/admins/:id/lock", ...guard, superadminController.lockAdmin);
router.delete("/super-admin/admins/:id", ...guard, superadminController.deleteAdmin);

// ── Audit Log ─────────────────────────────────────────────────
router.get("/super-admin/logs", ...guard, superadminController.getAuditLogs);

// ── Báo cáo tồn kho ───────────────────────────────────────────
router.get("/super-admin/stock-report", ...guard, superadminController.getStockReport);
router.get("/super-admin/stock-report/:productId", ...guard, superadminController.getStockMovements);

module.exports = router;
