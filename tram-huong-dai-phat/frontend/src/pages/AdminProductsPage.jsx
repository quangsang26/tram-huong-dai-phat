import { useEffect, useState } from "react";
import Header from "../components/Header";
import api from "../services/api";

function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    category_id: "",
    name: "",
    slug: "",
    description: "",
    price: "",
    stock: "",
    image_url: "",
    is_featured: false,
    status: "active",
  });

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get("/products"),
        api.get("/categories"),
      ]);

      setProducts(productsRes.data?.data || []);
      setCategories(categoriesRes.data?.data || []);
    } catch (error) {
      setMessage("Không thể tải dữ liệu admin");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);

    if (file) {
      setMessage(`Đã chọn ảnh: ${file.name}`);
    } else {
      setMessage("Chưa chọn ảnh");
    }
  };

  const handleUploadImage = async () => {
    if (!selectedFile) {
      setMessage("Vui lòng chọn ảnh trước");
      return;
    }

    try {
      setUploading(true);
      setMessage("");

      const uploadData = new FormData();
      uploadData.append("image", selectedFile);

      const res = await api.post("/admin/upload", uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setFormData((prev) => ({
        ...prev,
        image_url: res.data?.data?.image_url || "",
      }));

      setMessage("Upload ảnh thành công");
    } catch (error) {
      console.error("Upload error:", error);
      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Upload ảnh thất bại"
      );
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      category_id: "",
      name: "",
      slug: "",
      description: "",
      price: "",
      stock: "",
      image_url: "",
      is_featured: false,
      status: "active",
    });
    setEditingId(null);
    setSelectedFile(null);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!formData.name.trim()) {
      setMessage("Vui lòng nhập tên sản phẩm");
      return;
    }

    if (!formData.price || Number(formData.price) <= 0) {
      setMessage("Vui lòng nhập giá hợp lệ");
      return;
    }

    if (Number(formData.stock) < 0) {
      setMessage("Tồn kho không hợp lệ");
      return;
    }

    if (!formData.image_url) {
      setMessage("Vui lòng upload ảnh sản phẩm trước khi thêm");
      return;
    }

    try {
      const payload = {
        ...formData,
        category_id: formData.category_id ? Number(formData.category_id) : null,
        price: Number(formData.price),
        stock: Number(formData.stock || 0),
      };

      if (editingId) {
        await api.put(`/admin/products/${editingId}`, payload);
        setMessage("Cập nhật sản phẩm thành công");
      } else {
        await api.post("/admin/products", payload);
        setMessage("Thêm sản phẩm thành công");
      }

      await loadData();
      resetForm();
    } catch (error) {
      setMessage(error.response?.data?.message || "Thao tác thất bại");
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      category_id: product.category_id || "",
      name: product.name || "",
      slug: product.slug || "",
      description: product.description || "",
      price: product.price || "",
      stock: product.stock || "",
      image_url: product.image_url || "",
      is_featured: product.is_featured || false,
      status: product.status || "active",
    });
    setSelectedFile(null);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa sản phẩm này?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/admin/products/${id}`);
      setMessage("Xóa sản phẩm thành công");
      loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Xóa thất bại");
    }
  };

  const getStatusLabel = (status) => {
    if (status === "active") return "Đang bán";
    if (status === "hidden") return "Ẩn";
    if (status === "out_of_stock") return "Hết hàng";
    return status;
  };

  return (
    <>
      <Header />

      <main className="container section">
        <h1>Admin - Quản lý sản phẩm</h1>

        <form className="auth-form admin-form" onSubmit={handleSubmit}>
          <h2>{editingId ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}</h2>

          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
          >
            <option value="">Chọn danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="name"
            placeholder="Tên sản phẩm"
            value={formData.name}
            onChange={handleChange}
          />

          <input
            type="text"
            name="slug"
            placeholder="Slug"
            value={formData.slug}
            onChange={handleChange}
          />

          <textarea
            name="description"
            placeholder="Mô tả"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "12px",
              border: "1px solid #ddd",
              borderRadius: "10px",
              resize: "vertical",
            }}
          />

          <input
            type="number"
            name="price"
            placeholder="Giá"
            value={formData.price}
            onChange={handleChange}
            min="0"
          />

          <input
            type="number"
            name="stock"
            placeholder="Tồn kho"
            value={formData.stock}
            onChange={handleChange}
            min="0"
          />

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="active">Đang bán</option>
            <option value="hidden">Ẩn sản phẩm</option>
            <option value="out_of_stock">Hết hàng</option>
          </select>

          <input type="file" accept="image/*" onChange={handleFileChange} />

          {selectedFile && (
            <p style={{ margin: "8px 0", color: "#8b5e3c" }}>
              File đã chọn: {selectedFile.name}
            </p>
          )}

          <button
            type="button"
            className="gold-btn"
            onClick={handleUploadImage}
            disabled={uploading}
          >
            {uploading ? "Đang upload..." : "Upload ảnh từ máy"}
          </button>

          {formData.image_url && (
            <div style={{ margin: "12px 0" }}>
              <img
                src={formData.image_url}
                alt="Preview"
                style={{
                  width: "140px",
                  height: "140px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  border: "1px solid #ddd",
                }}
              />
            </div>
          )}

          <label className="checkbox-row">
            <input
              type="checkbox"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleChange}
            />
            Sản phẩm nổi bật
          </label>

          <div className="product-actions">
            <button type="submit" className="gold-btn" disabled={uploading}>
              {editingId ? "Cập nhật sản phẩm" : "Đăng sản phẩm lên bán"}
            </button>

            {editingId && (
              <button
                type="button"
                className="outline-btn"
                onClick={resetForm}
              >
                Hủy sửa
              </button>
            )}
          </div>

          {message && <p className="auth-message">{message}</p>}
        </form>

        <div className="admin-products-list">
          {products.map((product) => (
            <div key={product.id} className="order-card">
              <h3>{product.name}</h3>
              <p>Danh mục: {product.category_name || "Chưa có"}</p>
              <p>Giá: {Number(product.price).toLocaleString("vi-VN")} đ</p>
              <p>Tồn kho: {product.stock}</p>
              <p>Trạng thái: {getStatusLabel(product.status)}</p>
              <p>Nổi bật: {product.is_featured ? "Có" : "Không"}</p>

              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit: "cover",
                    borderRadius: "12px",
                    margin: "12px 0",
                    border: "1px solid #eee",
                  }}
                />
              )}

              <div className="product-actions">
                <button
                  className="outline-btn"
                  onClick={() => handleEdit(product)}
                >
                  Sửa
                </button>

                <button
                  className="remove-btn"
                  onClick={() => handleDelete(product.id)}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

export default AdminProductsPage;