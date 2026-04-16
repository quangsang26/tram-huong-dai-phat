const pool = require("../config/db");

const createOrder = async ({
  user_id,
  customer_name,
  phone,
  address,
  note,
  total_amount,
  payment_method,
  items,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const orderQuery = `
      INSERT INTO orders (
        user_id,
        customer_name,
        phone,
        address,
        note,
        total_amount,
        payment_method,
        payment_status,
        order_status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'unpaid', 'pending')
      RETURNING *
    `;

    const orderValues = [
      user_id || null,
      customer_name,
      phone,
      address,
      note || "",
      total_amount,
      payment_method || "COD",
    ];

    const orderResult = await client.query(orderQuery, orderValues);
    const newOrder = orderResult.rows[0];

    for (const item of items) {
      const itemQuery = `
        INSERT INTO order_items (
          order_id,
          product_id,
          product_name,
          price,
          quantity
        )
        VALUES ($1, $2, $3, $4, $5)
      `;

      const itemValues = [
        newOrder.id,
        item.product_id,
        item.product_name,
        item.price,
        item.quantity,
      ];

      await client.query(itemQuery, itemValues);

      await client.query(
        `
        UPDATE products
        SET stock = stock - $1
        WHERE id = $2 AND stock >= $1
        `,
        [item.quantity, item.product_id]
      );
    }

    await client.query("COMMIT");
    return newOrder;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Lỗi createOrder:", error.message);
    throw error;
  } finally {
    client.release();
  }
};

const createPendingMomoOrder = async ({
  user_id,
  customer_name,
  phone,
  address,
  note,
  total_amount,
  payment_method,
  items,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const orderQuery = `
      INSERT INTO orders (
        user_id,
        customer_name,
        phone,
        address,
        note,
        total_amount,
        payment_method,
        payment_status,
        order_status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'unpaid', 'pending')
      RETURNING *
    `;

    const orderValues = [
      user_id || null,
      customer_name,
      phone,
      address,
      note || "",
      total_amount,
      payment_method || "MOMO",
    ];

    const orderResult = await client.query(orderQuery, orderValues);
    const newOrder = orderResult.rows[0];

    for (const item of items) {
      const itemQuery = `
        INSERT INTO order_items (
          order_id,
          product_id,
          product_name,
          price,
          quantity
        )
        VALUES ($1, $2, $3, $4, $5)
      `;

      const itemValues = [
        newOrder.id,
        item.product_id,
        item.product_name,
        item.price,
        item.quantity,
      ];

      await client.query(itemQuery, itemValues);
    }

    await client.query("COMMIT");
    return newOrder;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Lỗi createPendingMomoOrder:", error.message);
    throw error;
  } finally {
    client.release();
  }
};

const deductStockByOrderId = async (orderId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const itemsResult = await client.query(
      `
      SELECT product_id, quantity
      FROM order_items
      WHERE order_id = $1
      `,
      [orderId]
    );

    for (const item of itemsResult.rows) {
      const updateResult = await client.query(
        `
        UPDATE products
        SET stock = stock - $1
        WHERE id = $2 AND stock >= $1
        RETURNING *
        `,
        [item.quantity, item.product_id]
      );

      if (updateResult.rowCount === 0) {
        throw new Error(`Sản phẩm ID ${item.product_id} không đủ tồn kho`);
      }
    }

    await client.query("COMMIT");
    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Lỗi deductStockByOrderId:", error.message);
    throw error;
  } finally {
    client.release();
  }
};

const getOrdersByUserId = async (userId) => {
  try {
    const orderResult = await pool.query(
      `
      SELECT *
      FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC, id DESC
      `,
      [userId]
    );

    const orders = orderResult.rows;

    for (const order of orders) {
      const itemsResult = await pool.query(
        `
        SELECT *
        FROM order_items
        WHERE order_id = $1
        ORDER BY id ASC
        `,
        [order.id]
      );
      order.items = itemsResult.rows;
    }

    return orders;
  } catch (error) {
    console.error("Lỗi getOrdersByUserId:", error.message);
    throw error;
  }
};

const getOrderById = async (orderId) => {
  try {
    const orderResult = await pool.query(
      `
      SELECT *
      FROM orders
      WHERE id = $1
      LIMIT 1
      `,
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return null;
    }

    const order = orderResult.rows[0];

    const itemsResult = await pool.query(
      `
      SELECT *
      FROM order_items
      WHERE order_id = $1
      ORDER BY id ASC
      `,
      [order.id]
    );

    order.items = itemsResult.rows;

    return order;
  } catch (error) {
    console.error("Lỗi getOrderById:", error.message);
    throw error;
  }
};

const getAllOrders = async () => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM orders
      ORDER BY created_at DESC, id DESC
      `
    );
    return result.rows;
  } catch (error) {
    console.error("Lỗi getAllOrders:", error.message);
    throw error;
  }
};

const updateOrderStatus = async (id, order_status) => {
  try {
    const result = await pool.query(
      `
      UPDATE orders
      SET order_status = $1
      WHERE id = $2
      RETURNING *
      `,
      [order_status, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Lỗi updateOrderStatus:", error.message);
    throw error;
  }
};

const updatePaymentAfterMomo = async (id, payment_status, order_status) => {
  try {
    const result = await pool.query(
      `
      UPDATE orders
      SET payment_status = $1,
          order_status = $2
      WHERE id = $3
      RETURNING *
      `,
      [payment_status, order_status, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Lỗi updatePaymentAfterMomo:", error.message);
    throw error;
  }
};

module.exports = {
  createOrder,
  createPendingMomoOrder,
  deductStockByOrderId,
  getOrdersByUserId,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updatePaymentAfterMomo,
};