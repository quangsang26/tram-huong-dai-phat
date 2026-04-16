import { Link } from "react-router-dom";
import { addToCart } from "../services/cart";

function ProductCard({ product }) {
  const isOutOfStock = product.status === "out_of_stock";
  const isHidden = product.status === "hidden";

  if (isHidden) return null;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product);
    alert("Đã thêm vào giỏ hàng");
  };

  return (
    <div className="premium-product-card">
      <div className="premium-product-image-wrap">
        <img
          src={product.image_url || "https://via.placeholder.com/500"}
          alt={product.name}
          className="premium-product-image"
        />
      </div>

      <div className="premium-product-body">
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
          {product.is_featured && <span className="badge gold">Nổi bật</span>}
          {isOutOfStock && <span className="badge red">Hết hàng</span>}
        </div>

        <p className="premium-product-category">
          {product.category_name || "Sản phẩm trầm hương"}
        </p>

        <h3 className="premium-product-name">{product.name}</h3>

        <p className="premium-product-price">
          {Number(product.price).toLocaleString("vi-VN")} đ
        </p>

        <p className="premium-product-stock">
          {isOutOfStock ? "Sản phẩm hiện đã hết hàng" : `Tồn kho: ${product.stock}`}
        </p>

        <div className="premium-product-actions">
          <Link to={`/products/${product.id}`} className="outline-btn">
            Xem chi tiết
          </Link>

          <button
            className="gold-btn"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            style={{ opacity: isOutOfStock ? 0.6 : 1, cursor: isOutOfStock ? "not-allowed" : "pointer" }}
          >
            {isOutOfStock ? "Hết hàng" : "Thêm giỏ hàng"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;