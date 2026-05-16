const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { verifyToken, requireAdmin } = require("../middlewares/auth.middleware");

// ─── Customer routes ──────────────────────────────────────────────────────────

// Tạo đơn hàng (khách vãng lai không cần đăng nhập, nhưng nếu có token thì lấy user_id)
router.post("/orders", orderController.createOrder);

// 🔒 FIX IDOR: bắt buộc verifyToken → user_id lấy từ req.user.id trong controller
//    Trước: GET /orders/user/:user_id  (ai cũng truy cập được đơn người khác)
//    Sau:   GET /orders/mine           (chỉ lấy đơn của chính mình qua token)
router.get("/orders/mine", verifyToken, orderController.getMyOrders);

// Xem chi tiết đơn (có kiểm tra chủ sở hữu bên trong controller)
router.get("/orders/:id", verifyToken, orderController.getOrderDetail);

// ─── Admin routes ─────────────────────────────────────────────────────────────
router.get("/admin/orders", verifyToken, requireAdmin, orderController.getAllOrders);
router.put("/admin/orders/:id", verifyToken, requireAdmin, orderController.updateOrderStatus);

module.exports = router;
