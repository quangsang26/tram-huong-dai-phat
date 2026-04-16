import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import {
  getCart,
  updateCartQuantity,
  removeFromCart,
} from "../services/cart";

function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  const loadCart = () => {
    setCart(getCart());
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleIncrease = (id, quantity) => {
    updateCartQuantity(id, quantity + 1);
    loadCart();
  };

  const handleDecrease = (id, quantity) => {
    updateCartQuantity(id, quantity - 1);
    loadCart();
  };

  const handleRemove = (id) => {
    removeFromCart(id);
    loadCart();
  };

  const invalidItems = useMemo(() => {
    return cart.filter(
      (item) => item.status === "hidden" || item.status === "out_of_stock"
    );
  }, [cart]);

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const handleCheckout = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (cart.length === 0) {
      alert("Giỏ hàng đang trống");
      return;
    }

    if (invalidItems.length > 0) {
      alert("Giỏ hàng có sản phẩm không hợp lệ. Vui lòng xử lý trước khi thanh toán.");
      return;
    }

    navigate("/checkout");
  };

  const getStatusLabel = (status) => {
    if (status === "active" || !status) return "Đang bán";
    if (status === "out_of_stock") return "Hết hàng";
    if (status === "hidden") return "Tạm ẩn";
    return status;
  };

  return (
    <>
      <Header />
      <main className="container section">
        <div className="page-heading">
          <p className="section-tag">Mua sắm</p>
          <h1>Giỏ hàng của bạn</h1>
        </div>

        {cart.length === 0 ? (
          <div className="empty-state-card">
            <h3>Giỏ hàng đang trống</h3>
            <p>Hãy khám phá thêm các sản phẩm trầm hương nổi bật của chúng tôi.</p>
            <Link to="/" className="gold-btn">
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <>
            {invalidItems.length > 0 && (
              <div className="warning-box">
                Giỏ hàng có sản phẩm đã hết hàng hoặc bị ẩn. Bạn cần xóa các sản
                phẩm đó trước khi thanh toán.
              </div>
            )}

            <div className="cart-layout">
              <div className="cart-list">
                {cart.map((item) => {
                  const isOutOfStock = item.status === "out_of_stock";
                  const isHidden = item.status === "hidden";
                  const isInvalid = isOutOfStock || isHidden;

                  return (
                    <div
                      key={item.id}
                      className="cart-item premium-cart-item"
                      style={{
                        border: isInvalid ? "1px solid #f1b6b6" : "none",
                      }}
                    >
                      <img
                        src={item.image_url || "https://via.placeholder.com/120"}
                        alt={item.name}
                        className="cart-image"
                      />

                      <div className="cart-info premium-cart-info">
                        <div>
                          <h3>{item.name}</h3>
                          <p className="cart-price">
                            {Number(item.price).toLocaleString("vi-VN")} đ
                          </p>
                          <p>
                            <strong>Trạng thái:</strong> {getStatusLabel(item.status)}
                          </p>

                          {isOutOfStock && (
                            <p className="invalid-note">Sản phẩm này hiện đã hết hàng</p>
                          )}

                          {isHidden && (
                            <p className="invalid-note">Sản phẩm này hiện đang bị ẩn</p>
                          )}
                        </div>

                        <div className="cart-actions-row">
                          <div className="cart-qty">
                            <button
                              onClick={() => handleDecrease(item.id, item.quantity)}
                              disabled={isInvalid}
                            >
                              -
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              onClick={() => handleIncrease(item.id, item.quantity)}
                              disabled={isInvalid}
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemove(item.id)}
                            className="remove-btn"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="cart-summary premium-summary-card">
                <p className="section-tag">Tóm tắt</p>
                <h2>Tổng đơn hàng</h2>
                <p className="summary-total">{total.toLocaleString("vi-VN")} đ</p>

                <button onClick={handleCheckout} className="gold-btn">
                  Tiến hành đặt hàng
                </button>

                <Link to="/" className="outline-btn" style={{ textAlign: "center" }}>
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>
          </>
        )}

        {!user && cart.length > 0 && (
          <p style={{ marginTop: "16px" }}>
            Bạn cần đăng nhập trước khi thanh toán. <Link to="/login">Đăng nhập ngay</Link>
          </p>
        )}
      </main>
    </>
  );
}

export default CartPage;