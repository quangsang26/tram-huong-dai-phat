import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import Header from "../components/Header";
import { addToCart } from "../services/cart";

function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct]     = useState(null);
  const [images, setImages]       = useState([]);
  const [mainImg, setMainImg]     = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [message, setMessage]     = useState("");
  const [quantity, setQuantity]   = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        const productData = res.data?.data;

        if (productData?.status === "hidden") {
          setMessage("Sản phẩm này hiện đang tạm ẩn.");
          return;
        }

        setProduct(productData);
        setMainImg(productData.image_url || "");

        // Lấy ảnh phụ từ bảng product_images
        const imgRes = await api.get(`/products/${id}/images`);
        const extraImages = imgRes.data?.data || [];
        setImages(extraImages);
      } catch (error) {
        setMessage("Không thể tải chi tiết sản phẩm");
      }
    };

    fetchProduct();
  }, [id]);

  // Tất cả ảnh = ảnh chính + ảnh phụ
  const allImages = [
    ...(product?.image_url ? [{ id: "main", image_url: product.image_url }] : []),
    ...images,
  ];

  const handleSelectImage = (img, idx) => {
    setMainImg(img.image_url);
    setActiveIdx(idx);
  };

  const handleAddToCart = () => {
    if (!product || product.status !== "active") return;
    addToCart({ ...product, quantity });
    setMessage("✅ Đã thêm vào giỏ hàng!");
    setTimeout(() => setMessage(""), 2500);
  };

  const getStatusLabel = (status) => {
    if (status === "active")       return { label: "Đang bán",  color: "#166534", bg: "#f0fdf4" };
    if (status === "out_of_stock") return { label: "Hết hàng",  color: "#991b1b", bg: "#fef2f2" };
    if (status === "hidden")       return { label: "Tạm ẩn",    color: "#78716c", bg: "#f8f5f0" };
    return { label: status, color: "#4a3520", bg: "#f8f5f0" };
  };

  if (message && !product) {
    return (
      <>
        <Header />
        <main className="container section">
          <div className="order-detail-card">
            <h1>Thông báo</h1>
            <p>{message}</p>
            <Link to="/" className="gold-btn">Quay lại trang chủ</Link>
          </div>
        </main>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <main className="container section" style={{ textAlign: "center", padding: "80px 0" }}>
          <p style={{ color: "#9a8a7a" }}>Đang tải sản phẩm...</p>
        </main>
      </>
    );
  }

  const statusStyle = getStatusLabel(product.status);
  const isOutOfStock = product.status === "out_of_stock";

  return (
    <>
      <Header />
      <style>{`
        .gallery-wrap {
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: sticky;
          top: 20px;
        }
        .gallery-main {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #eadfce;
          background: #f8f5f0;
          position: relative;
        }
        .gallery-main img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 0.2s;
        }
        .gallery-thumbs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .gallery-thumb {
          width: 72px;
          height: 72px;
          border-radius: 10px;
          overflow: hidden;
          border: 2px solid transparent;
          cursor: pointer;
          transition: border-color 0.2s, transform 0.15s;
          flex-shrink: 0;
          background: #f0e8d8;
        }
        .gallery-thumb:hover { transform: scale(1.05); }
        .gallery-thumb.active { border-color: #c89b3c; }
        .gallery-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .detail-wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 24px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: start;
        }
        .qty-wrap {
          display: flex;
          align-items: center;
          gap: 0;
          border: 1.5px solid #e0d5c5;
          border-radius: 12px;
          overflow: hidden;
          width: fit-content;
          margin-bottom: 16px;
        }
        .qty-btn {
          width: 40px;
          height: 40px;
          border: none;
          background: #f8f5f0;
          color: #4a3520;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s;
        }
        .qty-btn:hover { background: #ede5d8; }
        .qty-num {
          width: 48px;
          text-align: center;
          font-size: 16px;
          font-weight: 700;
          color: #2d1f16;
          border: none;
          border-left: 1.5px solid #e0d5c5;
          border-right: 1.5px solid #e0d5c5;
          outline: none;
          background: #fff;
          padding: 0;
          height: 40px;
        }
        .toast-msg {
          background: #f0fdf4;
          border: 1px solid #86efac;
          color: #166534;
          border-radius: 12px;
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 12px;
        }
        @media (max-width: 768px) {
          .detail-wrap { grid-template-columns: 1fr; gap: 24px; padding: 20px 16px; }
          .gallery-wrap { position: static; }
        }
      `}</style>

      <main>
        <div className="detail-wrap">
          {/* ── Cột trái: Gallery kiểu Shopee ── */}
          <div className="gallery-wrap">
            {/* Ảnh chính */}
            <div className="gallery-main">
              {mainImg ? (
                <img src={mainImg} alt={product.name} />
              ) : (
                <div style={{
                  width: "100%", height: "100%",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 64, color: "#c4b5a5",
                }}>🌿</div>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="gallery-thumbs">
                {allImages.map((img, idx) => (
                  <div
                    key={img.id}
                    className={`gallery-thumb ${idx === activeIdx ? "active" : ""}`}
                    onClick={() => handleSelectImage(img, idx)}
                  >
                    <img src={img.image_url} alt={`Ảnh ${idx + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Cột phải: Thông tin sản phẩm ── */}
          <div className="detail-content">
            {/* Badges */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              {product.is_featured && <span className="badge gold">Nổi bật</span>}
              <span style={{
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 700,
                background: statusStyle.bg,
                color: statusStyle.color,
              }}>{statusStyle.label}</span>
            </div>

            <p className="product-category">{product.category_name || "Sản phẩm trầm hương"}</p>
            <h1 style={{ margin: "8px 0 16px", fontSize: "clamp(22px, 3vw, 32px)", color: "#2d1f16" }}>
              {product.name}
            </h1>

            <p className="detail-price" style={{ fontSize: 32, marginBottom: 20 }}>
              {Number(product.price).toLocaleString("vi-VN")} đ
            </p>

            <div style={{ background: "#f8f5f0", borderRadius: 14, padding: "14px 18px", marginBottom: 20 }}>
              <p style={{ margin: "0 0 6px", fontSize: 14, color: "#7a6b5f" }}>
                <strong>Tồn kho:</strong> {product.stock} sản phẩm
              </p>
              {product.description && (
                <p style={{ margin: 0, fontSize: 14, color: "#5a4a3a", lineHeight: 1.6 }}>
                  {product.description}
                </p>
              )}
            </div>

            {/* Chọn số lượng */}
            {!isOutOfStock && (
              <div>
                <p style={{ fontSize: 14, color: "#7a6b5f", marginBottom: 8, fontWeight: 600 }}>
                  Số lượng:
                </p>
                <div className="qty-wrap">
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >−</button>
                  <input
                    className="qty-num"
                    type="number"
                    min={1}
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(product.stock, Math.max(1, Number(e.target.value))))}
                  />
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  >+</button>
                </div>
              </div>
            )}

            {message && <div className="toast-msg">{message}</div>}

            <div className="product-actions">
              <button
                className="gold-btn"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                style={{ opacity: isOutOfStock ? 0.6 : 1, cursor: isOutOfStock ? "not-allowed" : "pointer" }}
              >
                {isOutOfStock ? "Hết hàng" : "🛒 Thêm giỏ hàng"}
              </button>
              <Link to="/cart" className="outline-btn">Xem giỏ hàng</Link>
              <Link to="/" className="outline-btn">Trang chủ</Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default ProductDetailPage;
