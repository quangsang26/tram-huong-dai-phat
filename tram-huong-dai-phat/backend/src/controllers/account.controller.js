const bcrypt = require("bcrypt");
const accountRepository = require("../repositories/account.repository");

const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await accountRepository.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng",
      });
    }

    res.status(200).json({
      message: "Lấy thông tin tài khoản thành công",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi lấy thông tin tài khoản",
      error: error.message,
    });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phone, address } = req.body;

    if (!full_name || !full_name.trim()) {
      return res.status(400).json({
        message: "Vui lòng nhập họ và tên",
      });
    }

    const updatedUser = await accountRepository.updateUserProfile(userId, {
      full_name,
      phone,
      address,
    });

    if (!updatedUser) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng để cập nhật",
      });
    }

    res.status(200).json({
      message: "Cập nhật thông tin thành công",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi cập nhật thông tin tài khoản",
      error: error.message,
    });
  }
};

const changeMyPassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { current_password, new_password, confirm_password } = req.body;

    if (!current_password || !new_password || !confirm_password) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ các trường mật khẩu",
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        message: "Mật khẩu mới phải có ít nhất 6 ký tự",
      });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({
        message: "Xác nhận mật khẩu mới không khớp",
      });
    }

    const user = await accountRepository.getUserWithPasswordById(userId);

    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng",
      });
    }

    const isMatch = await bcrypt.compare(current_password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Mật khẩu hiện tại không đúng",
      });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await accountRepository.updateUserPassword(userId, hashedPassword);

    res.status(200).json({
      message: "Đổi mật khẩu thành công",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi đổi mật khẩu",
      error: error.message,
    });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
};