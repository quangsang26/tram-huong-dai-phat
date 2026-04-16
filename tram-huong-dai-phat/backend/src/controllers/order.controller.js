const orderRepository = require("../repositories/order.repository");

const createOrder = async (req, res) => {
  try {
    const {
      user_id,
      customer_name,
      phone,
      address,
      note,
      payment_method,
      items,
    } = req.body;

    if (!customer_name || !phone || !address || !items || items.length === 0) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ thông tin và sản phẩm đặt hàng",
      });
    }

    const total_amount = items.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );

    const newOrder = await orderRepository.createOrder({
      user_id,
      customer_name,
      phone,
      address,
      note,
      total_amount,
      payment_method,
      items,
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

const getMyOrders = async (req, res) => {
  try {
    const { user_id } = req.params;

    const orders = await orderRepository.getOrdersByUserId(user_id);

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
      return res.status(404).json({
        message: "Không tìm thấy đơn hàng",
      });
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