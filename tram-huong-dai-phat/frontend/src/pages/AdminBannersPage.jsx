import { useEffect, useState } from "react";
import Header from "../components/Header";
import api from "../services/api";

const EMPTY_FORM = {
  title: "",
  description: "",
  image_url: "",
  sort_order: "0",
  is_active: true,
};

function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const loadBanners = async () => {
    try {
      const res = await api.get("/admin/banners");
      setBanners(res.data.data || []);
    } catch {
      setMessage("Không tải được danh sách banner");
    }
  };

  useEffect(() => { loadBanners(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setForm((p) => ({ ...p, [name]: val }));
    if (name === "image_url") setPreviewUrl(value);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadAndGetUrl = async () => {
    if (!selectedFile) return form.image_url;
    setUploading(true);
    try {
      const data = new FormData();
      data.append("image", selectedFile);
      const res = await api.post("/admin/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = res.data?.data?.image_url || "";
      setForm((p) => ({ ...p, image_url: url }));
      return url;
    } catch {
      setMessage("Upload ảnh thất bại");
      return "";
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    let imageUrl = form.image_url;
    if (selectedFile) {
      imageUrl = await handleUploadAndGetUrl();
      if (!imageUrl) return;
    }

    const payload = { ...form, image_url: imageUrl };

    try {
      if (editingId) {
        await api.put(`/admin/banners/${editingId}`, payload);
        setMessage("Cập nhật banner thành công!");
      } else {
        await api.post("/admin/banners", payload);
        setMessage("Thêm banner thành công!");
      }
      resetForm();
      loadBanners();
    } catch (err) {
      setMessage(err.response?.data?.message || "Thao tác thất bại");
    }
  };

  const handleEdit = (banner) => {
    setEditingId(banner.id);
    setForm({
      title: banner.title,
      description: banner.description || "",
      image_url: banner.image_url,
      sort_order: String(banner.sort_order),
      is_active: banner.is_active,
    });
    setPreviewUrl(banner.image_url);
    setSelectedFile(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (banner) => {
    if (!window.confirm(`Xác nhận xoá banner "${banner.title}"?`)) return;
    try {
      await api.delete(`/admin/banners/${banner.id}`);
      setMessage("Đã xoá banner");
      loadBanners();
    } catch {
      setMessage("Xoá thất bại");
    }
  };

  const handleToggleActive = async (banner) => {
    try {
      await api.put(`/admin/banners/${banner.id}`, {
        ...banner,
        is_active: !banner.is_active,
      });
      loadBanners();
    } catch {
      setMessage("Cập nhật thất bại");
    }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    setPreviewUrl("");
    setSelectedFile(null);
  };

  return (
    <>
      <Header />
      <main className="container section">
        <style>{`
          .banner-form-card { background:#fff; border:1px solid #eadfce; border-radius:20px; padding:28px; margin-bottom:28px; }
          .banner-input { width:100%; border:1px solid #e0d5c5; border-radius:12px; padding:12px 16px; font-size:15px; font-family:inherit; outline:none; box-sizing:border-box; }
          .banner-input:focus { border-color:#c89b3c; box-shadow:0 0 0 3px rgba(200,155,60,0.1); }
          .banner-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:18px; }
          .banner-card { background:#fff; border:1px solid #eadfce; border-radius:18px; overflow:hidden; }
          .banner-card.inactive { opacity:0.6; }
          .banner-card-img { width:100%; height:190px; object-fit:cover; display:block; background:#f0e8d8; }
          .banner-card-body { padding:16px 18px; }
          .banner-card-actions { display:flex; gap:8px; margin-top:12px; flex-wrap:wrap; }
          .btn-edit { padding:7px 16px; border-radius:999px; border:1.5px solid #c89b3c; background:#fff; color:#7b5b28; font-weight:600; cursor:pointer; font-size:13px; }
          .btn-edit:hover { background:#fffbee; }
          .btn-del { padding:7px 16px; border-radius:999px; border:1.5px solid #dc2626; background:#fef2f2; color:#991b1b; font-weight:600; cursor:pointer; font-size:13px; }
          .btn-toggle { padding:7px 16px; border-radius:999px; border:1.5px solid #6d28d9; background:#f5f3ff; color:#5b21b6; font-weight:600; cursor:pointer; font-size:13px; }
          .sort-badge { display:inline-block; padding:2px 10px; border-radius:999px; background:#f8f5f0; color:#7b5b28; font-size:12px; font-weight:700; margin-left:8px; }
          .active-badge { display:inline-block; padding:2px 10px; border-radius:999px; font-size:12px; font-weight:700; }
          .active-badge.on { background:#f0fdf4; color:#166534; }
          .active-badge.off { background:#fef2f2; color:#991b1b; }
          .preview-img { width:100%; height:200px; object-fit:cover; border-radius:12px; margin-top:12px; border:1px solid #eadfce; }
          .form-label { font-size:13px; font-weight:700; color:#7b5b28; margin-bottom:6px; display:block; }
          .form-row { margin-bottom:16px; }
          .form-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
          @media(max-width:640px) { .form-grid2 { grid-template-columns:1fr; } }
        `}</style>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12, marginBottom:24 }}>
          <div className="page-heading" style={{ margin:0 }}>
            <p className="section-tag">Admin</p>
            <h1 style={{ margin:0 }}>Quản lý Banner trang chủ</h1>
          </div>
          <button
            className="gold-btn"
            style={{ padding:"10px 24px" }}
            onClick={() => { resetForm(); setShowForm(!showForm); }}
          >
            {showForm && !editingId ? "Đóng" : "+ Thêm banner mới"}
          </button>
        </div>

        {message && <p className="auth-message" style={{ marginBottom:16 }}>{message}</p>}

        {/* Form thêm / sửa */}
        {showForm && (
          <div className="banner-form-card">
            <h3 style={{ marginBottom:20, color:"#4a3520" }}>
              {editingId ? "✏️ Chỉnh sửa banner" : "➕ Thêm banner mới"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <label className="form-label">Tiêu đề banner *</label>
                <input className="banner-input" name="title" placeholder="VD: Vườn Trầm Hương Đại Phát" value={form.title} onChange={handleChange} required />
              </div>

              <div className="form-row">
                <label className="form-label">Mô tả ngắn</label>
                <textarea className="banner-input" name="description" placeholder="Mô tả hiển thị dưới tiêu đề..." value={form.description} onChange={handleChange} rows={3} />
              </div>

              <div className="form-row">
                <label className="form-label">Chọn ảnh từ máy tính</label>
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ fontSize:14 }} />
                <p style={{ color:"#9a8a7a", fontSize:13, marginTop:6 }}>
                  Hoặc dán URL ảnh từ internet vào bên dưới:
                </p>
                <input className="banner-input" name="image_url" placeholder="https://..." value={form.image_url} onChange={handleChange} style={{ marginTop:6 }} />
                {previewUrl && <img src={previewUrl} className="preview-img" alt="Preview" onError={(e) => e.target.style.display="none"} />}
              </div>

              <div className="form-grid2">
                <div className="form-row">
                  <label className="form-label">Thứ tự hiển thị (số nhỏ = lên đầu)</label>
                  <input className="banner-input" type="number" name="sort_order" value={form.sort_order} onChange={handleChange} min="0" />
                </div>
                <div className="form-row" style={{ display:"flex", alignItems:"center", gap:10, paddingTop:28 }}>
                  <input type="checkbox" name="is_active" id="is_active" checked={form.is_active} onChange={handleChange} style={{ width:18, height:18 }} />
                  <label htmlFor="is_active" style={{ fontSize:15, color:"#4a3520", fontWeight:600 }}>Hiển thị trên trang chủ</label>
                </div>
              </div>

              <div style={{ display:"flex", gap:12, marginTop:8 }}>
                <button type="submit" className="gold-btn" disabled={uploading}>
                  {uploading ? "Đang upload..." : editingId ? "Lưu thay đổi" : "Thêm banner"}
                </button>
                <button type="button" className="btn-edit" onClick={resetForm}>Huỷ</button>
              </div>
            </form>
          </div>
        )}

        {/* Danh sách banner */}
        {banners.length === 0 ? (
          <div className="empty-state-card">
            <h3>Chưa có banner nào</h3>
            <p>Thêm banner đầu tiên để hiển thị slideshow trên trang chủ.</p>
          </div>
        ) : (
          <div className="banner-grid">
            {banners.map((banner) => (
              <div key={banner.id} className={`banner-card ${!banner.is_active ? "inactive" : ""}`}>
                {banner.image_url ? (
                  <img src={banner.image_url} className="banner-card-img" alt={banner.title} onError={(e) => { e.target.style.display="none"; }} />
                ) : (
                  <div className="banner-card-img" style={{ display:"flex", alignItems:"center", justifyContent:"center", color:"#c4b5a5" }}>Chưa có ảnh</div>
                )}
                <div className="banner-card-body">
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <h3 style={{ margin:0, fontSize:16, color:"#2d1f16", flex:1 }}>{banner.title}</h3>
                    <span className={`active-badge ${banner.is_active ? "on" : "off"}`}>
                      {banner.is_active ? "✅ Hiện" : "🔒 Ẩn"}
                    </span>
                  </div>
                  {banner.description && (
                    <p style={{ margin:"8px 0 0", fontSize:13, color:"#7a6b5f", lineHeight:1.5 }}>
                      {banner.description.length > 80 ? banner.description.slice(0, 80) + "..." : banner.description}
                    </p>
                  )}
                  <p style={{ margin:"6px 0 0", fontSize:12, color:"#b8a898" }}>
                    Thứ tự: <span className="sort-badge">#{banner.sort_order}</span>
                  </p>
                  <div className="banner-card-actions">
                    <button className="btn-edit" onClick={() => handleEdit(banner)}>✏️ Sửa</button>
                    <button className="btn-toggle" onClick={() => handleToggleActive(banner)}>
                      {banner.is_active ? "🔒 Ẩn" : "👁 Hiện"}
                    </button>
                    <button className="btn-del" onClick={() => handleDelete(banner)}>🗑 Xoá</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

export default AdminBannersPage;
