import { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import api from "../services/api";

const EMPTY_FORM = {
  category_id: "", name: "", slug: "", description: "",
  price: "", stock: "", image_url: "", is_featured: false, status: "active",
};

function AdminProductsPage() {
  const [products, setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [message, setMessage]     = useState("");
  const [msgType, setMsgType]     = useState("error");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData]   = useState(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Ảnh phụ
  const [extraImages, setExtraImages]         = useState({}); // { productId: [images] }
  const [uploadingExtra, setUploadingExtra]   = useState(null); // productId đang upload
  const extraFileRefs                          = useRef({});

  const showMsg = (text, type = "success") => {
    setMessage(text);
    setMsgType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  const loadData = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        api.get("/products"),
        api.get("/categories"),
      ]);
      setProducts(pRes.data?.data || []);
      setCategories(cRes.data?.data || []);
    } catch {
      showMsg("Không thể tải dữ liệu", "error");
    }
  };

  useEffect(() => { loadData(); }, []);

  // Load ảnh phụ khi danh sách products thay đổi
  useEffect(() => {
    if (products.length === 0) return;
    products.forEach(async (p) => {
      try {
        const res = await api.get(`/products/${p.id}/images`);
        setExtraImages((prev) => ({ ...prev, [p.id]: res.data?.data || [] }));
      } catch { /* bỏ qua */ }
    });
  }, [products]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleUploadMain = async () => {
    if (!selectedFile) return showMsg("Vui lòng chọn ảnh", "error");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", selectedFile);
      const res = await api.post("/admin/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData((prev) => ({ ...prev, image_url: res.data?.data?.image_url || "" }));
      showMsg("Upload ảnh chính thành công!");
    } catch {
      showMsg("Upload thất bại", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return showMsg("Vui lòng nhập tên sản phẩm", "error");
    if (!formData.price || Number(formData.price) <= 0) return showMsg("Vui lòng nhập giá hợp lệ", "error");
    if (!formData.image_url) return showMsg("Vui lòng upload ảnh chính trước", "error");

    const payload = {
      ...formData,
      category_id: formData.category_id ? Number(formData.category_id) : null,
      price: Number(formData.price),
      stock: Number(formData.stock || 0),
    };

    try {
      if (editingId) {
        await api.put(`/admin/products/${editingId}`, payload);
        showMsg("Cập nhật sản phẩm thành công!");
      } else {
        await api.post("/admin/products", payload);
        showMsg("Thêm sản phẩm thành công!");
      }
      resetForm();
      loadData();
    } catch (err) {
      showMsg(err.response?.data?.message || "Thao tác thất bại", "error");
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xác nhận xoá sản phẩm này?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      showMsg("Xoá sản phẩm thành công!");
      loadData();
    } catch (err) {
      showMsg(err.response?.data?.message || "Xoá thất bại", "error");
    }
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setSelectedFile(null);
  };

  // ── Upload ảnh phụ trực tiếp trên card ──────────────────
  const handleExtraImageClick = (productId) => {
    extraFileRefs.current[productId]?.click();
  };

  const handleExtraFileChange = async (e, productId) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingExtra(productId);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const uploadRes = await api.post("/admin/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const imageUrl = uploadRes.data?.data?.image_url || "";
      if (!imageUrl) throw new Error("Không lấy được URL ảnh");

      await api.post(`/admin/products/${productId}/images`, {
        image_url: imageUrl,
        sort_order: (extraImages[productId]?.length || 0),
      });

      // Cập nhật state
      const imgRes = await api.get(`/products/${productId}/images`);
      setExtraImages((prev) => ({ ...prev, [productId]: imgRes.data?.data || [] }));
      showMsg("Thêm ảnh phụ thành công!");
    } catch {
      showMsg("Upload ảnh phụ thất bại", "error");
    } finally {
      setUploadingExtra(null);
      e.target.value = "";
    }
  };

  const handleDeleteExtraImage = async (imageId, productId) => {
    if (!window.confirm("Xoá ảnh này?")) return;
    try {
      await api.delete(`/admin/product-images/${imageId}`);
      setExtraImages((prev) => ({
        ...prev,
        [productId]: prev[productId]?.filter((img) => img.id !== imageId) || [],
      }));
    } catch {
      showMsg("Xoá ảnh thất bại", "error");
    }
  };

  const getStatusLabel = (s) => {
    if (s === "active")       return { label: "Đang bán",  color: "#166534", bg: "#f0fdf4" };
    if (s === "hidden")       return { label: "Ẩn",         color: "#78716c", bg: "#f8f5f0" };
    if (s === "out_of_stock") return { label: "Hết hàng",  color: "#991b1b", bg: "#fef2f2" };
    return { label: s, color: "#4a3520", bg: "#f8f5f0" };
  };

  return (
    <>
      <Header />
      <main className="container section">
        <style>{`
          .ap-form { background:#fff; border:1px solid #eadfce; border-radius:20px; padding:28px; margin-bottom:32px; }
          .ap-input { width:100%; border:1px solid #e0d5c5; border-radius:12px; padding:12px 16px; font-size:15px; font-family:inherit; outline:none; box-sizing:border-box; margin-bottom:12px; }
          .ap-input:focus { border-color:#c89b3c; }
          .ap-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
          .ap-label { font-size:13px; font-weight:700; color:#7b5b28; margin-bottom:6px; display:block; }

          .product-card-admin { background:#fff; border:1px solid #eadfce; border-radius:18px; overflow:hidden; margin-bottom:16px; }
          .product-card-inner { display:grid; grid-template-columns:160px 1fr; gap:0; }
          .product-card-img-wrap { position:relative; width:160px; height:160px; background:#f0e8d8; flex-shrink:0; }
          .product-card-img-wrap img { width:100%; height:100%; object-fit:cover; }

          .extra-images-row { padding:12px 16px; border-top:1px solid #f0e8d8; display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
          .extra-thumb { position:relative; width:64px; height:64px; border-radius:8px; overflow:hidden; border:1px solid #eadfce; flex-shrink:0; }
          .extra-thumb img { width:100%; height:100%; object-fit:cover; }
          .extra-thumb-del { position:absolute; top:2px; right:2px; width:18px; height:18px; border-radius:50%; background:rgba(220,38,38,0.85); border:none; color:#fff; font-size:11px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
          .add-extra-btn { width:64px; height:64px; border-radius:8px; border:2px dashed #c89b3c; background:#fffbee; color:#7b5b28; font-size:22px; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:background 0.2s; }
          .add-extra-btn:hover { background:#fff8d6; }

          .status-pill { display:inline-block; padding:3px 10px; border-radius:999px; font-size:12px; font-weight:700; }
          @media(max-width:640px) { .product-card-inner { grid-template-columns:1fr; } .product-card-img-wrap { width:100%; height:200px; } .ap-grid2 { grid-template-columns:1fr; } }
        `}</style>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <div className="page-heading" style={{ margin:0 }}>
            <p className="section-tag">Admin</p>
            <h1 style={{ margin:0 }}>Quản lý sản phẩm</h1>
          </div>
          <p style={{ color:"#9a8a7a", fontSize:14 }}>{products.length} sản phẩm</p>
        </div>

        {message && (
          <p style={{
            background: msgType === "success" ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${msgType === "success" ? "#86efac" : "#fca5a5"}`,
            color: msgType === "success" ? "#166534" : "#991b1b",
            borderRadius: 12, padding: "10px 16px", marginBottom: 16, fontSize: 14, fontWeight: 600,
          }}>{message}</p>
        )}

        {/* Form thêm / sửa */}
        <div className="ap-form">
          <h3 style={{ margin:"0 0 20px", color:"#4a3520" }}>
            {editingId ? "✏️ Cập nhật sản phẩm" : "➕ Thêm sản phẩm mới"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="ap-grid2">
              <div>
                <label className="ap-label">Danh mục</label>
                <select className="ap-input" name="category_id" value={formData.category_id} onChange={handleChange}>
                  <option value="">Chọn danh mục</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="ap-label">Trạng thái</label>
                <select className="ap-input" name="status" value={formData.status} onChange={handleChange}>
                  <option value="active">Đang bán</option>
                  <option value="out_of_stock">Hết hàng</option>
                  <option value="hidden">Ẩn sản phẩm</option>
                </select>
              </div>
            </div>

            <label className="ap-label">Tên sản phẩm *</label>
            <input className="ap-input" name="name" placeholder="Tên sản phẩm" value={formData.name} onChange={handleChange} required />

            <label className="ap-label">Mô tả</label>
            <textarea className="ap-input" name="description" placeholder="Mô tả sản phẩm..." value={formData.description} onChange={handleChange} rows={3} style={{ resize:"vertical" }} />

            <div className="ap-grid2">
              <div>
                <label className="ap-label">Giá (đ) *</label>
                <input className="ap-input" type="number" name="price" placeholder="Giá" value={formData.price} onChange={handleChange} min="0" />
              </div>
              <div>
                <label className="ap-label">Tồn kho</label>
                <input className="ap-input" type="number" name="stock" placeholder="Số lượng" value={formData.stock} onChange={handleChange} min="0" />
              </div>
            </div>

            {/* Upload ảnh chính */}
            <label className="ap-label">Ảnh chính *</label>
            <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:12 }}>
              <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} style={{ fontSize:14, flex:1 }} />
              <button type="button" className="gold-btn" style={{ whiteSpace:"nowrap", padding:"10px 18px" }} onClick={handleUploadMain} disabled={uploading}>
                {uploading ? "Đang upload..." : "Upload"}
              </button>
            </div>
            {formData.image_url && (
              <img src={formData.image_url} alt="Preview" style={{ width:120, height:120, objectFit:"cover", borderRadius:12, border:"1px solid #eadfce", marginBottom:12 }} />
            )}

            <label className="checkbox-row" style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
              <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} style={{ width:18, height:18 }} />
              <span style={{ fontSize:15, fontWeight:600, color:"#4a3520" }}>Sản phẩm nổi bật</span>
            </label>

            <div style={{ display:"flex", gap:12 }}>
              <button type="submit" className="gold-btn" disabled={uploading}>
                {editingId ? "Lưu thay đổi" : "Thêm sản phẩm"}
              </button>
              {editingId && (
                <button type="button" className="outline-btn" onClick={resetForm}>Huỷ</button>
              )}
            </div>
          </form>
        </div>

        {/* Danh sách sản phẩm */}
        {products.map((product) => {
          const status = getStatusLabel(product.status);
          const pExtraImages = extraImages[product.id] || [];

          return (
            <div key={product.id} className="product-card-admin">
              <div className="product-card-inner">
                {/* Ảnh chính */}
                <div className="product-card-img-wrap">
                  {product.image_url
                    ? <img src={product.image_url} alt={product.name} />
                    : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:40 }}>🌿</div>
                  }
                </div>

                {/* Thông tin */}
                <div style={{ padding:"14px 16px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
                    <h3 style={{ margin:0, fontSize:16, color:"#2d1f16" }}>{product.name}</h3>
                    <span className="status-pill" style={{ background:status.bg, color:status.color, flexShrink:0 }}>
                      {status.label}
                    </span>
                  </div>
                  <p style={{ margin:"6px 0 2px", color:"#9a8a7a", fontSize:13 }}>{product.category_name || "Chưa có danh mục"}</p>
                  <p style={{ margin:"2px 0", fontWeight:700, color:"#c89b3c", fontSize:16 }}>
                    {Number(product.price).toLocaleString("vi-VN")}đ
                  </p>
                  <p style={{ margin:"2px 0", fontSize:13, color:"#7a6b5f" }}>Tồn kho: {product.stock}</p>

                  <div style={{ display:"flex", gap:8, marginTop:10, flexWrap:"wrap" }}>
                    <button className="outline-btn" style={{ padding:"6px 14px", fontSize:13 }} onClick={() => handleEdit(product)}>✏️ Sửa</button>
                    <button className="remove-btn" style={{ padding:"6px 14px", fontSize:13 }} onClick={() => handleDelete(product.id)}>🗑 Xoá</button>
                  </div>
                </div>
              </div>

              {/* Ảnh phụ — kiểu Shopee */}
              <div className="extra-images-row">
                <span style={{ fontSize:13, fontWeight:700, color:"#7b5b28", marginRight:4, flexShrink:0 }}>
                  📷 Ảnh phụ:
                </span>

                {/* Thumbnails ảnh phụ */}
                {pExtraImages.map((img) => (
                  <div key={img.id} className="extra-thumb">
                    <img src={img.image_url} alt="Ảnh phụ" />
                    <button
                      className="extra-thumb-del"
                      onClick={() => handleDeleteExtraImage(img.id, product.id)}
                      title="Xoá ảnh"
                    >×</button>
                  </div>
                ))}

                {/* Nút thêm ảnh phụ */}
                {pExtraImages.length < 5 && (
                  <>
                    <button
                      className="add-extra-btn"
                      onClick={() => handleExtraImageClick(product.id)}
                      title="Thêm ảnh phụ"
                      disabled={uploadingExtra === product.id}
                    >
                      {uploadingExtra === product.id ? "⏳" : "+"}
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display:"none" }}
                      ref={(el) => (extraFileRefs.current[product.id] = el)}
                      onChange={(e) => handleExtraFileChange(e, product.id)}
                    />
                  </>
                )}

                {pExtraImages.length === 0 && uploadingExtra !== product.id && (
                  <span style={{ fontSize:12, color:"#b8a898" }}>Chưa có ảnh phụ — click + để thêm (tối đa 5 ảnh)</span>
                )}
              </div>
            </div>
          );
        })}
      </main>
    </>
  );
}

export default AdminProductsPage;
