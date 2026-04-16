export const getCart = () => {
  return JSON.parse(localStorage.getItem("cart")) || [];
};

export const saveCart = (cart) => {
  localStorage.setItem("cart", JSON.stringify(cart));
};

export const addToCart = (product) => {
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart(cart);
};

export const updateCartQuantity = (productId, quantity) => {
  let cart = getCart();

  cart = cart.map((item) =>
    item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
  );

  saveCart(cart);
};

export const removeFromCart = (productId) => {
  const cart = getCart().filter((item) => item.id !== productId);
  saveCart(cart);
};

export const clearCart = () => {
  localStorage.removeItem("cart");
};