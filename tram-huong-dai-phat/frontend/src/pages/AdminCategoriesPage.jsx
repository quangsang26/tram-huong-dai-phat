import { useEffect, useState } from "react";
import Header from "../components/Header";
import api from "../services/api";

function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const loadCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.data || []);
    } catch (error) {
      setMessage("Không thể tải danh mục");
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      if (editingId) {
        await api.put(`/admin/categories/${editingId}`, formData);
        setMessage("Cập nhật danh mục thành công");
      } else {
        await api.post("/admin/categories", formData);
        setMessage("Thêm danh mục thành công");
      }

      resetForm();
      loadCategories();
    } catch (error) {
      setMessage(error.response?.data?.message || "Thao tác thất bại");
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name || "",
      description: category.description || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa danh mục này?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/admin/categories/${id}`);
      setMessage("Xóa danh mục thành công");
      loadCategories();
    } catch (error) {
      setMessage(error.response?.data?.message || "Xóa thất bại");
    }
  };

  return (
    <>
      <Header />
      <main className="container section">
        <h1>Admin - Quản lý danh mục</h1>

        <form className="auth-form admin-form" onSubmit={handleSubmit}>
          <h2>{editingId ? "Cập nhật danh mục" : "Thêm danh mục mới"}</h2>

          <input
            type="text"
            name="name"
            placeholder="Tên danh mục"
            value={formData.name}
            onChange={handleChange}
          />

          <input
            type="text"
            name="description"
            placeholder="Mô tả danh mục"
            value={formData.description}
            onChange={handleChange}
          />

          <div className="product-actions">
            <button type="submit" className="gold-btn">
              {editingId ? "Cập nhật danh mục" : "Thêm danh mục"}
            </button>

            {editingId && (
              <button type="button" className="outline-btn" onClick={resetForm}>
                Hủy sửa
              </button>
            )}
          </div>

          {message && <p className="auth-message">{message}</p>}
        </form>

        <div className="admin-products-list">
          {categories.map((category) => (
            <div key={category.id} className="order-card">
              <h3>{category.name}</h3>
              <p>{category.description || "Chưa có mô tả"}</p>

              <div className="product-actions">
                <button className="outline-btn" onClick={() => handleEdit(category)}>
                  Sửa
                </button>
                <button className="remove-btn" onClick={() => handleDelete(category.id)}>
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

export default AdminCategoriesPage;