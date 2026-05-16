const productImageRepository = require("../repositories/productImage.repository");

/** GET /api/products/:productId/images */
const getProductImages = async (req, res) => {
  try {
    const { productId } = req.params;
    const images = await productImageRepository.getImagesByProductId(productId);
    res.status(200).json({ message: "Lấy ảnh sản phẩm thành công", data: images });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/** POST /api/admin/products/:productId/images */
const addProductImage = async (req, res) => {
  try {
    const { productId } = req.params;
    const { image_url, sort_order } = req.body;

    if (!image_url) {
      return res.status(400).json({ message: "Vui lòng cung cấp URL ảnh" });
    }

    const image = await productImageRepository.addProductImage(
      productId,
      image_url,
      sort_order || 0
    );

    res.status(201).json({ message: "Thêm ảnh thành công", data: image });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/** DELETE /api/admin/product-images/:imageId */
const deleteProductImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const deleted = await productImageRepository.deleteProductImage(imageId);

    if (!deleted) {
      return res.status(404).json({ message: "Không tìm thấy ảnh" });
    }

    res.status(200).json({ message: "Xoá ảnh thành công", data: deleted });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

module.exports = { getProductImages, addProductImage, deleteProductImage };
