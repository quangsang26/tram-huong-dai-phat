const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { verifyToken, requireAdmin } = require("../middlewares/auth.middleware");

router.post("/orders", orderController.createOrder);
router.get("/orders/user/:user_id", orderController.getMyOrders);
router.get("/orders/:id", orderController.getOrderDetail);

router.get("/admin/orders", verifyToken, requireAdmin, orderController.getAllOrders);
router.put("/admin/orders/:id", verifyToken, requireAdmin, orderController.updateOrderStatus);

module.exports = router;