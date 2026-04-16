const axios = require("axios");
const crypto = require("crypto");
const orderRepository = require("../repositories/order.repository");

const createMomoPayment = async (req, res) => {
  try {
    const { user_id, customer_name, phone, address, note, items } = req.body;

    if (!customer_name || !phone || !address || !items || items.length === 0) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ thông tin và sản phẩm đặt hàng",
      });
    }

    const total_amount = items.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );

    if (total_amount < 1000) {
      return res.status(400).json({
        message: "Số tiền thanh toán MoMo tối thiểu là 1.000đ",
      });
    }

    const partnerCode = process.env.MOMO_PARTNER_CODE;
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;
    const endpoint = process.env.MOMO_ENDPOINT;
    const frontendUrl = process.env.FRONTEND_URL;
    const backendPublicUrl = process.env.BACKEND_PUBLIC_URL;

    if (
      !partnerCode ||
      !accessKey ||
      !secretKey ||
      !endpoint ||
      !frontendUrl ||
      !backendPublicUrl
    ) {
      return res.status(500).json({
        message: "Thiếu cấu hình MoMo trong file .env",
      });
    }

    const newOrder = await orderRepository.createPendingMomoOrder({
      user_id,
      customer_name,
      phone,
      address,
      note,
      total_amount,
      payment_method: "MOMO",
      items,
    });

    const requestId = partnerCode + new Date().getTime();
    const orderId = requestId;
    const orderInfo = `Thanh toan don hang #${newOrder.id}`;
    const redirectUrl = `${frontendUrl}/payment-result?orderId=${newOrder.id}`;
    const ipnUrl = `${backendPublicUrl}/api/momo/ipn`;
    const amount = String(total_amount);
    const requestType = "captureWallet";
    const extraData = Buffer.from(
      JSON.stringify({ orderDbId: newOrder.id })
    ).toString("base64");

    const rawSignature =
      "accessKey=" +
      accessKey +
      "&amount=" +
      amount +
      "&extraData=" +
      extraData +
      "&ipnUrl=" +
      ipnUrl +
      "&orderId=" +
      orderId +
      "&orderInfo=" +
      orderInfo +
      "&partnerCode=" +
      partnerCode +
      "&redirectUrl=" +
      redirectUrl +
      "&requestId=" +
      requestId +
      "&requestType=" +
      requestType;

    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    const requestBody = {
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType,
      signature,
      lang: "vi",
    };

    console.log("===== MOMO CREATE REQUEST =====");
    console.log(requestBody);

    const momoResponse = await axios.post(endpoint, requestBody, {
      headers: { "Content-Type": "application/json" },
      timeout: 30000,
    });

    console.log("===== MOMO CREATE RESPONSE =====");
    console.log(momoResponse.data);

    if (momoResponse.data.resultCode !== 0) {
      return res.status(400).json({
        message: momoResponse.data.message || "Tạo thanh toán MoMo thất bại",
        error: momoResponse.data,
      });
    }

    return res.status(200).json({
      message: "Tạo link thanh toán MoMo thành công",
      order: newOrder,
      payUrl: momoResponse.data.payUrl,
      momoData: momoResponse.data,
    });
  } catch (error) {
    console.error("Lỗi createMomoPayment FULL:");
    console.error(error.response?.data || error.message);

    return res.status(500).json({
      message: "Lỗi server khi tạo thanh toán MoMo",
      error: error.response?.data || error.message,
    });
  }
};

const momoIpn = async (req, res) => {
  try {
    const data = req.body;

    console.log("===== MOMO IPN =====");
    console.log(JSON.stringify(data, null, 2));

    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;

    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${data.amount}` +
      `&extraData=${data.extraData || ""}` +
      `&message=${data.message}` +
      `&orderId=${data.orderId}` +
      `&orderInfo=${data.orderInfo}` +
      `&orderType=${data.orderType}` +
      `&partnerCode=${data.partnerCode}` +
      `&payType=${data.payType}` +
      `&requestId=${data.requestId}` +
      `&responseTime=${data.responseTime}` +
      `&resultCode=${data.resultCode}` +
      `&transId=${data.transId}`;

    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    if (signature !== data.signature) {
      console.error("Sai chữ ký IPN");
      return res.status(400).json({
        message: "Sai chữ ký IPN",
      });
    }

    let orderDbId = null;

    if (data.extraData) {
      try {
        const decoded = JSON.parse(
          Buffer.from(data.extraData, "base64").toString("utf8")
        );
        orderDbId = decoded.orderDbId;
      } catch (err) {
        console.error("Không giải mã được extraData:", err.message);
      }
    }

    if (!orderDbId) {
      return res.status(400).json({
        message: "Không tìm thấy orderDbId trong extraData",
      });
    }

    if (Number(data.resultCode) === 0) {
      await orderRepository.updatePaymentAfterMomo(
        orderDbId,
        "paid",
        "confirmed"
      );

      await orderRepository.deductStockByOrderId(orderDbId);

      console.log(`Đơn hàng #${orderDbId} đã thanh toán thành công`);
    } else {
      await orderRepository.updatePaymentAfterMomo(
        orderDbId,
        "failed",
        "cancelled"
      );

      console.log(`Đơn hàng #${orderDbId} thanh toán thất bại`);
    }

    return res.status(200).json({
      message: "IPN processed successfully",
    });
  } catch (error) {
    console.error("Lỗi momoIpn FULL:");
    console.error(error);

    return res.status(500).json({
      message: "Lỗi server khi xử lý IPN",
      error: error.message,
    });
  }
};

const confirmMomoReturn = async (req, res) => {
  try {
    const { orderId, resultCode } = req.body;

    console.log("===== CONFIRM MOMO RETURN =====");
    console.log("orderId =", orderId);
    console.log("resultCode =", resultCode);

    if (!orderId) {
      return res.status(400).json({
        message: "Thiếu orderId",
      });
    }

    const order = await orderRepository.getOrderById(orderId);
    console.log("order found =", order);

    if (!order) {
      return res.status(404).json({
        message: "Không tìm thấy đơn hàng",
      });
    }

    if (String(resultCode) === "0") {
      if (order.payment_status !== "paid") {
        console.log("Bắt đầu update paid từ confirm-return");

        await orderRepository.updatePaymentAfterMomo(
          orderId,
          "paid",
          "confirmed"
        );

        console.log("Bắt đầu trừ tồn kho từ confirm-return");

        await orderRepository.deductStockByOrderId(orderId);
      }

      return res.status(200).json({
        message: "Đã xác nhận thanh toán MoMo thành công",
      });
    }

    if (order.payment_status !== "paid") {
      await orderRepository.updatePaymentAfterMomo(
        orderId,
        "failed",
        "cancelled"
      );
    }

    return res.status(200).json({
      message: "Thanh toán MoMo thất bại",
    });
  } catch (error) {
    console.error("Lỗi confirmMomoReturn FULL:");
    console.error(error);

    return res.status(500).json({
      message: "Lỗi xác nhận thanh toán MoMo",
      error: error.message,
    });
  }
};

module.exports = {
  createMomoPayment,
  momoIpn,
  confirmMomoReturn,
};