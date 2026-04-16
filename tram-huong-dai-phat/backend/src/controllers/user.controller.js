const userRepository = require("../repositories/user.repository");

const getAllUsers = async (req, res) => {
  try {
    const users = await userRepository.getAllUsers();
    res.status(200).json({
      message: "Lấy danh sách người dùng thành công",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi lấy danh sách người dùng",
      error: error.message,
    });
  }
};

const getUserDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userRepository.getUserById(id);

    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng",
      });
    }

    const orders = await userRepository.getOrdersByUserId(id);

    res.status(200).json({
      message: "Lấy chi tiết người dùng thành công",
      data: {
        ...user,
        orders,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi lấy chi tiết người dùng",
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserDetail,
};