import { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import api from "../services/api";

const EMPTY_FORM = { name: "", description: "" };

function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("error"); // "error" | "success"
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [uploadingId, setUploadingId] = useState(null); // ID danh mục đang upload ảnh
  const fileInputRefs = useRef({}); // ref cho từng input file ẩn

  const showMsg = (text, type = "success") => {
    setMessage(text);
    setMsgType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  const loadCategories = async () => {
  try {
    // Thêm ?t= để tránh browser cache
    const res = await api.get(`/categories?t=${Date.now()}`);
    setCategories(res.data.data || []);
  } catch {
    showMsg("Không thể tải danh mục", "error");
  }
};

  useEffect(() => { loadCategories(); }, []);

  // ── Form thêm / sửa tên + mô tả ─────────────────────────
  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/categories/${editingId}`, formData);
        showMsg("Cập nhật danh mục thành công!");
      } else {
        await api.post("/admin/categories", formData);
        showMsg("Thêm danh mục thành công!");
      }
      setFormData(EMPTY_FORM);
      setEditingId(null);
      loadCategories();
    } catch (err) {
      showMsg(err.response?.data?.message || "Thao tác thất bại", "error");
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setFormData({ name: cat.name || "", description: cat.description || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Xác nhận xoá danh mục "${cat.name}"?`)) return;
    try {
      await api.delete(`/admin/categories/${cat.id}`);
      showMsg("Đã xoá danh mục");
      loadCategories();
    } catch (err) {
      showMsg(err.response?.data?.message || "Xoá thất bại", "error");
    }
  };

  // ── Upload ảnh trực tiếp trên card ──────────────────────
  const handleImageClick = (catId) => {
    // Kích hoạt input file ẩn của đúng card
    fileInputRefs.current[catId]?.click();
  };

  const handleImageChange = async (e, cat) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(cat.id);

    try {
      // Upload file lên server
      const formData = new FormData();
      formData.append("image", file);
      const uploadRes = await api.post("/admin/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const image_url = uploadRes.data?.data?.image_url || "";
      if (!image_url) throw new Error("Không lấy được URL ảnh");

      // Cập nhật danh mục với ảnh mới
      await api.put(`/admin/categories/${cat.id}`, {
        name: cat.name,
        description: cat.description,
        image_url,
      });

      // Cập nhật state trực tiếp — tránh browser cache 304
        setCategories((prev) =>
        prev.map((c) => c.id === cat.id ? { ...c, image_url } : c)
      );
showMsg(`Đã cập nhật ảnh cho "${cat.name}"!`);
    } catch (err) {
      showMsg("Upload ảnh thất bại. Vui lòng thử lại.", "error");
    } finally {
      setUploadingId(null);
      // Reset input để có thể chọn lại cùng file
      e.target.value = "";
    }
  };

  return (
    <>
      <Header />
      <main className="container section">
        <style>{`
          .cat-form-card { background:#fff; border:1px solid #eadfce; border-radius:20px; padding:28px; margin-bottom:32px; }
          .cat-input { width:100%; border:1px solid #e0d5c5; border-radius:12px; padding:12px 16px; font-size:15px; font-family:inherit; outline:none; box-sizing:border-box; }
          .cat-input:focus { border-color:#c89b3c; box-shadow:0 0 0 3px rgba(200,155,60,0.1); }
          .cat-label { font-size:13px; font-weight:700; color:#7b5b28; margin-bottom:6px; display:block; }
          .cat-row { margin-bottom:16px; }
          .cat-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:18px; }

          /* Card danh mục */
          .cat-card { background:#fff; border:1px solid #eadfce; border-radius:18px; overflow:hidden; transition:box-shadow 0.2s; }
          .cat-card:hover { box-shadow:0 6px 24px rgba(0,0,0,0.10); }

          /* Vùng ảnh — click để đổi */
          .cat-img-zone {
            position:relative; width:100%; height:175px;
            cursor:pointer; overflow:hidden;
            background:linear-gradient(135deg,#2d1f16,#4a3520);
          }
          .cat-img-zone img { width:100%; height:175px; object-fit:cover; display:block; transition:transform 0.3s; }
          .cat-img-zone:hover img { transform:scale(1.04); }

          /* Overlay xuất hiện khi hover */
          .cat-img-hover-overlay {
            position:absolute; inset:0;
            background:rgba(0,0,0,0.45);
            display:flex; flex-direction:column;
            align-items:center; justify-content:center;
            gap:6px;
            opacity:0; transition:opacity 0.25s;
          }
          .cat-img-zone:hover .cat-img-hover-overlay { opacity:1; }
          .cat-img-hover-overlay span:first-child { font-size:28px; }
          .cat-img-hover-overlay span:last-child {
            color:#fff; font-size:13px; font-weight:700;
            background:rgba(200,155,60,0.85);
            padding:4px 14px; border-radius:999px;
          }

          /* Placeholder khi chưa có ảnh */
          .cat-img-placeholder {
            width:100%; height:175px;
            display:flex; flex-direction:column;
            align-items:center; justify-content:center;
            gap:8px; cursor:pointer;
          }
          .cat-img-placeholder:hover .cat-img-hover-overlay { opacity:1; }
          .cat-placeholder-icon { font-size:48px; }
          .cat-placeholder-text { color:rgba(255,255,255,0.7); font-size:13px; font-weight:600; }

          /* Loading spinner khi upload */
          .cat-uploading {
            position:absolute; inset:0;
            background:rgba(0,0,0,0.6);
            display:flex; flex-direction:column;
            align-items:center; justify-content:center; gap:10px;
          }
          .spinner {
            width:36px; height:36px; border-radius:50%;
            border:3px solid rgba(255,255,255,0.2);
            border-top-color:#c89b3c;
            animation:spin 0.8s linear infinite;
          }
          @keyframes spin { to { transform:rotate(360deg); } }
          .cat-uploading p { color:#fff; font-size:13px; font-weight:600; }

          .cat-card-body { padding:16px 18px; }
          .cat-card-actions { display:flex; gap:8px; margin-top:12px; }
          .btn-edit { padding:8px 18px; border-radius:999px; border:1.5px solid #c89b3c; background:#fff; color:#7b5b28; font-weight:600; cursor:pointer; font-size:13px; }
          .btn-edit:hover { background:#fffbee; }
          .btn-del { padding:8px 18px; border-radius:999px; border:1.5px solid #dc2626; background:#fef2f2; color:#991b1b; font-weight:600; cursor:pointer; font-size:13px; }
          .msg-success { color:#166534; background:#f0fdf4; border:1px solid #86efac; border-radius:12px; padding:12px 16px; margin-bottom:16px; }
          .msg-error   { color:#991b1b; background:#fef2f2; border:1px solid #fca5a5; border-radius:12px; padding:12px 16px; margin-bottom:16px; }
        `}</style>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12, marginBottom:24 }}>
          <div className="page-heading" style={{ margin:0 }}>
            <p className="section-tag">Admin</p>
            <h1 style={{ margin:0 }}>Quản lý danh mục</h1>
          </div>
          <p style={{ color:"#9a8a7a", fontSize:14 }}>{categories.length} danh mục</p>
        </div>

        {message && (
          <p className={msgType === "success" ? "msg-success" : "msg-error"}>
            {message}
          </p>
        )}

        {/* Form thêm / sửa tên & mô tả */}
        <div className="cat-form-card">
          <h3 style={{ margin:"0 0 20px", color:"#4a3520" }}>
            {editingId ? "✏️ Chỉnh sửa danh mục" : "➕ Thêm danh mục mới"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="cat-row">
              <label className="cat-label">Tên danh mục *</label>
              <input className="cat-input" name="name" placeholder="VD: Vòng tay trầm hương" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="cat-row">
              <label className="cat-label">Mô tả</label>
              <input className="cat-input" name="description" placeholder="Mô tả ngắn về danh mục..." value={formData.description} onChange={handleChange} />
            </div>
            <div style={{ display:"flex", gap:12 }}>
              <button type="submit" className="gold-btn">
                {editingId ? "Lưu thay đổi" : "Thêm danh mục"}
              </button>
              {editingId && (
                <button type="button" className="btn-edit" onClick={() => { setEditingId(null); setFormData(EMPTY_FORM); }}>
                  Huỷ
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Hướng dẫn nhanh */}
        <div style={{ background:"#fffbee", border:"1px solid #f0d898", borderRadius:12, padding:"12px 16px", marginBottom:24 }}>
          <p style={{ margin:0, fontSize:14, color:"#7b5b28" }}>
            💡 <strong>Mẹo:</strong> Hover vào ảnh của danh mục → click <strong>"📷 Đổi ảnh"</strong> để upload ảnh trực tiếp — không cần mở form!
          </p>
        </div>

        {/* Danh sách danh mục */}
        {categories.length === 0 ? (
          <div className="empty-state-card">
            <h3>Chưa có danh mục nào</h3>
            <p>Thêm danh mục đầu tiên bằng form bên trên.</p>
          </div>
        ) : (
          <div className="cat-grid">
            {categories.map((cat) => (
              <div key={cat.id} className="cat-card">

                {/* Vùng ảnh — click để đổi ảnh trực tiếp */}
                <div
                  className="cat-img-zone"
                  onClick={() => handleImageClick(cat.id)}
                  title="Click để đổi ảnh"
                >
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name}
                      onError={(e) => { e.target.style.display="none"; }} />
                  ) : (
                    <div className="cat-img-placeholder">
                      <span className="cat-placeholder-icon">🌿</span>
                      <span className="cat-placeholder-text">Chưa có ảnh</span>
                    </div>
                  )}

                  {/* Overlay hover */}
                  <div className="cat-img-hover-overlay">
                    <span>📷</span>
                    <span>Đổi ảnh</span>
                  </div>

                  {/* Loading khi đang upload */}
                  {uploadingId === cat.id && (
                    <div className="cat-uploading">
                      <div className="spinner" />
                      <p>Đang upload...</p>
                    </div>
                  )}
                </div>

                {/* Input file ẩn — mỗi card 1 cái */}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display:"none" }}
                  ref={(el) => (fileInputRefs.current[cat.id] = el)}
                  onChange={(e) => handleImageChange(e, cat)}
                />

                {/* Thông tin danh mục */}
                <div className="cat-card-body">
                  <h3 style={{ margin:"0 0 4px", fontSize:16, color:"#2d1f16" }}>
                    {cat.name}
                  </h3>
                  <p style={{ margin:0, fontSize:13, color:"#7a6b5f", lineHeight:1.5 }}>
                    {cat.description || (
                      <span style={{ color:"#c4b5a5" }}>Chưa có mô tả</span>
                    )}
                  </p>
                  <div className="cat-card-actions">
                    <button className="btn-edit" onClick={() => handleEdit(cat)}>✏️ Sửa tên</button>
                    <button className="btn-del" onClick={() => handleDelete(cat)}>🗑 Xoá</button>
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

export default AdminCategoriesPage;
