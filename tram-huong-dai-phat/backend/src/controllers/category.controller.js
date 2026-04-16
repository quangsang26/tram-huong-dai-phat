const categoryRepository = require("../repositories/category.repository");

const getCategories = async (req, res) => {
  try {
    const categories = await categoryRepository.getAllCategories();
    res.status(200).json({
      message: "Lấy danh mục thành công",
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi lấy danh mục",
      error: error.message,
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Vui lòng nhập tên danh mục",
      });
    }

    const newCategory = await categoryRepository.createCategory({
      name,
      description,
    });

    res.status(201).json({
      message: "Thêm danh mục thành công",
      data: newCategory,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi thêm danh mục",
      error: error.message,
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const updatedCategory = await categoryRepository.updateCategory(id, {
      name,
      description,
    });

    if (!updatedCategory) {
      return res.status(404).json({
        message: "Không tìm thấy danh mục",
      });
    }

    res.status(200).json({
      message: "Cập nhật danh mục thành công",
      data: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi cập nhật danh mục",
      error: error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCategory = await categoryRepository.deleteCategory(id);

    if (!deletedCategory) {
      return res.status(404).json({
        message: "Không tìm thấy danh mục",
      });
    }

    res.status(200).json({
      message: "Xóa danh mục thành công",
      data: deletedCategory,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi xóa danh mục",
      error: error.message,
    });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};