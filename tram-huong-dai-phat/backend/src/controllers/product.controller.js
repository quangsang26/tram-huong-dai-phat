const productRepository = require("../repositories/product.repository");

const getProducts = async (req, res) => {
  try {
    const { search, category_id } = req.query;

    const products = await productRepository.getAllProducts({
      search,
      category_id,
    });

    res.status(200).json({
      message: "Lấy danh sách sản phẩm thành công",
      data: products,
    });
  } catch (error) {
    console.error("Lỗi getProducts:", error.message);
    res.status(500).json({
      message: "Lỗi server khi lấy danh sách sản phẩm",
      error: error.message,
    });
  }
};

const getProductDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await productRepository.getProductById(id);

    if (!product) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm",
      });
    }

    res.status(200).json({
      message: "Lấy chi tiết sản phẩm thành công",
      data: product,
    });
  } catch (error) {
    console.error("Lỗi getProductDetail:", error.message);
    res.status(500).json({
      message: "Lỗi server khi lấy chi tiết sản phẩm",
      error: error.message,
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await productRepository.getAllCategories();
    res.status(200).json({
      message: "Lấy danh mục thành công",
      data: categories,
    });
  } catch (error) {
    console.error("Lỗi getCategories:", error.message);
    res.status(500).json({
      message: "Lỗi server khi lấy danh mục",
      error: error.message,
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      category_id,
      name,
      slug,
      description,
      price,
      stock,
      image_url,
      is_featured,
      status,
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        message: "Vui lòng nhập tên sản phẩm và giá",
      });
    }

    const newProduct = await productRepository.createProduct({
      category_id,
      name,
      slug,
      description,
      price,
      stock,
      image_url,
      is_featured,
      status,
    });

    res.status(201).json({
      message: "Thêm sản phẩm thành công",
      data: newProduct,
    });
  } catch (error) {
    console.error("Lỗi createProduct:", error.message);
    res.status(500).json({
      message: "Lỗi server khi thêm sản phẩm",
      error: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category_id,
      name,
      slug,
      description,
      price,
      stock,
      image_url,
      is_featured,
      status,
    } = req.body;

    const updatedProduct = await productRepository.updateProduct(id, {
      category_id,
      name,
      slug,
      description,
      price,
      stock,
      image_url,
      is_featured,
      status,
    });

    if (!updatedProduct) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm để cập nhật",
      });
    }

    res.status(200).json({
      message: "Cập nhật sản phẩm thành công",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Lỗi updateProduct:", error.message);
    res.status(500).json({
      message: "Lỗi server khi cập nhật sản phẩm",
      error: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await productRepository.deleteProduct(id);

    if (!deletedProduct) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm để xóa",
      });
    }

    res.status(200).json({
      message: "Xóa sản phẩm thành công",
      data: deletedProduct,
    });
  } catch (error) {
    console.error("Lỗi deleteProduct:", error.message);
    res.status(500).json({
      message: "Lỗi server khi xóa sản phẩm",
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getProductDetail,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
};