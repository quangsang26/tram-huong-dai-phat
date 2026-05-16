const orderRepository = require("../repositories/order.repository");
const pool = require("../config/db");
const { logAdminAction } = require("../utils/auditLog");

// ═══════════════════════════════════════════════════════════
// 🔒 FIX 1: Lấy giá sản phẩm từ DATABASE thay vì tin client
//    Trước đây: total = items.reduce(... item.price ...)  ← NGUY HIỂM
//    Bây giờ:   query giá thật từ bảng products
// ═══════════════════════════════════════════════════════════
const createOrder = async (req, res) => {
  try {
    const { customer_name, phone, address, note, payment_method, items } = req.body;

    // user_id lấy từ token nếu đã đăng nhập, không lấy từ body
    const user_id = req.user?.id || null;

    if (!customer_name || !phone || !address || !items || items.length === 0) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ thông tin và sản phẩm đặt hàng",
      });
    }

    // ── Lấy giá thật từ DB ────────────────────────────────
    const productIds = items.map((item) => Number(item.product_id));

    const priceResult = await pool.query(
      `SELECT id, price, stock, status FROM products WHERE id = ANY($1)`,
      [productIds]
    );

    const productMap = {};
    for (const row of priceResult.rows) {
      productMap[row.id] = row;
    }

    // Kiểm tra từng sản phẩm có hợp lệ không
    for (const item of items) {
      const product = productMap[Number(item.product_id)];

      if (!product) {
        return res.status(400).json({
          message: `Sản phẩm ID ${item.product_id} không tồn tại`,
        });
      }

      if (product.status === "hidden") {
        return res.status(400).json({
          message: `Sản phẩm "${item.product_id}" hiện không còn bán`,
        });
      }

      if (Number(product.stock) < Number(item.quantity)) {
        return res.status(400).json({
          message: `Sản phẩm ID ${item.product_id} không đủ tồn kho (còn ${product.stock})`,
        });
      }
    }

    // Tính tổng tiền từ GIÁ THẬT trong DB (không dùng item.price từ client)
    const total_amount = items.reduce((sum, item) => {
      const realPrice = Number(productMap[Number(item.product_id)].price);
      return sum + realPrice * Number(item.quantity);
    }, 0);

    // Gắn giá thật vào từng item trước khi lưu
    const safeItems = items.map((item) => ({
      ...item,
      price: Number(productMap[Number(item.product_id)].price),
    }));

    const newOrder = await orderRepository.createOrder({
      user_id,
      customer_name,
      phone,
      address,
      note,
      total_amount: Math.round(total_amount), // đảm bảo số nguyên (cần cho MoMo)
      payment_method,
      items: safeItems,
    });

    res.status(201).json({
      message: "Tạo đơn hàng thành công",
      data: newOrder,
    });
  } catch (error) {
    console.error("Lỗi createOrder:", error.message);
    res.status(500).json({
      message: "Lỗi server khi tạo đơn hàng",
      error: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════
// 🔒 FIX 2: Sửa IDOR — dùng req.user.id từ JWT, không lấy từ URL
//    Trước đây: GET /orders/user/:user_id  ← ai cũng đổi được
//    Bây giờ:   lấy id từ token đã xác thực
// ═══════════════════════════════════════════════════════════
const getMyOrders = async (req, res) => {
  try {
    // Lấy user_id từ JWT token (đã verify bởi middleware verifyToken)
    const userId = req.user.id;

    const orders = await orderRepository.getOrdersByUserId(userId);

    res.status(200).json({
      message: "Lấy danh sách đơn hàng thành công",
      data: orders,
    });
  } catch (error) {
    console.error("Lỗi getMyOrders:", error.message);
    res.status(500).json({
      message: "Lỗi server khi lấy danh sách đơn hàng",
      error: error.message,
    });
  }
};

const getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await orderRepository.getOrderById(id);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Nếu là customer: chỉ được xem đơn của chính mình
    const role = req.user?.role;
    if (role !== "admin" && role !== "super_admin") {
      if (order.user_id !== req.user?.id) {
        return res.status(403).json({ message: "Bạn không có quyền xem đơn hàng này" });
      }
    }

    res.status(200).json({
      message: "Lấy chi tiết đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    console.error("Lỗi getOrderDetail:", error.message);
    res.status(500).json({
      message: "Lỗi server khi lấy chi tiết đơn hàng",
      error: error.message,
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await orderRepository.getAllOrders();
    res.status(200).json({
      message: "Lấy tất cả đơn hàng thành công",
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi lấy tất cả đơn hàng",
      error: error.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_status, payment_status } = req.body;

    const updatedOrder = await orderRepository.updateOrderStatus(
      id,
      order_status,
      payment_status
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    logAdminAction(
      req.user,
      "CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG",
      "order",
      Number(id),
      `Đơn #${id} | Trạng thái: → ${order_status}` +
        (payment_status ? ` | Thanh toán: → ${payment_status}` : "")
    );

    res.status(200).json({
      message: "Cập nhật trạng thái đơn hàng thành công",
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi cập nhật trạng thái đơn hàng",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderDetail,
  getAllOrders,
  updateOrderStatus,
};
