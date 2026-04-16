import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import Header from "../components/Header";
import { addToCart } from "../services/cart";

function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        const productData = res.data?.data;

        if (productData?.status === "hidden") {
          setMessage("Sản phẩm này hiện đang tạm ẩn.");
          setProduct(null);
          return;
        }

        setProduct(productData);
      } catch (error) {
        console.error("Lỗi lấy chi tiết sản phẩm:", error);
        setMessage("Không thể tải chi tiết sản phẩm");
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product || product.status !== "active") return;

    addToCart(product);
    alert("Đã thêm vào giỏ hàng");
  };

  const getStatusLabel = (status) => {
    if (status === "active") return "Đang bán";
    if (status === "out_of_stock") return "Hết hàng";
    if (status === "hidden") return "Tạm ẩn";
    return status;
  };

  if (message) {
    return (
      <>
        <Header />
        <main className="container section">
          <div className="order-detail-card">
            <h1>Thông báo</h1>
            <p>{message}</p>
            <Link to="/" className="gold-btn">
              Quay lại trang chủ
            </Link>
          </div>
        </main>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <main className="container section">
          <p>Đang tải chi tiết sản phẩm...</p>
        </main>
      </>
    );
  }

  const isOutOfStock = product.status === "out_of_stock";

  return (
    <>
      <Header />

      <main className="detail-page">
        <div className="detail-image-wrap">
          <img
            src={product.image_url || "https://via.placeholder.com/500"}
            alt={product.name}
            className="detail-image"
          />
        </div>

        <div className="detail-content">
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
            {product.is_featured && <span className="badge gold">Nổi bật</span>}
            {isOutOfStock && <span className="badge red">Hết hàng</span>}
          </div>

          <p className="product-category">{product.category_name || "Sản phẩm trầm hương"}</p>

          <h1>{product.name}</h1>

          <p className="detail-price">
            {Number(product.price).toLocaleString("vi-VN")} đ
          </p>

          <p className="detail-stock">
            <strong>Trạng thái:</strong> {getStatusLabel(product.status)}
          </p>

          <p className="detail-stock">
            <strong>Tồn kho:</strong> {product.stock}
          </p>

          <p className="detail-description">
            {product.description || "Chưa có mô tả cho sản phẩm này."}
          </p>

          <div className="product-actions">
            <button
              className="gold-btn"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              style={{
                opacity: isOutOfStock ? 0.6 : 1,
                cursor: isOutOfStock ? "not-allowed" : "pointer",
              }}
            >
              {isOutOfStock ? "Hết hàng" : "Thêm giỏ hàng"}
            </button>

            <Link to="/cart" className="outline-btn">
              Xem giỏ hàng
            </Link>

            <Link to="/" className="outline-btn">
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

export default ProductDetailPage;