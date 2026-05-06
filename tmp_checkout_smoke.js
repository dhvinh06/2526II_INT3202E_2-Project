const mysql = require("mysql2/promise");

async function req(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  return { status: res.status, data };
}

async function main() {
  const db = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "warm_editorial",
  });

  const tag = Date.now();
  await db.query("INSERT INTO users(name,email,password,role_id) VALUES (?,?,?,1)", [
    `Smoke User ${tag}`,
    `smoke_${tag}@example.com`,
    "x",
  ]);
  const [[user]] = await db.query("SELECT id FROM users WHERE email=?", [`smoke_${tag}@example.com`]);

  await db.query("INSERT INTO categories(name,slug,parent_id) VALUES (?,?,NULL)", [
    `Smoke Cat ${tag}`,
    `smoke-cat-${tag}`,
  ]);
  const [[cat]] = await db.query("SELECT id FROM categories WHERE slug=?", [`smoke-cat-${tag}`]);

  await db.query("INSERT INTO brands(name,description) VALUES (?,?)", [`Smoke Brand ${tag}`, "smoke"]);
  const [[brand]] = await db.query("SELECT id FROM brands WHERE name=? ORDER BY id DESC LIMIT 1", [`Smoke Brand ${tag}`]);

  await db.query(
    "INSERT INTO products(name,price,image,images,category_id,description,rating,sold,stock,brand_id) VALUES (?,?,?,?,?,?,?,?,?,?)",
    [`Smoke Product ${tag}`, 100, null, null, cat.id, "smoke", 0.0, 0, 5, brand.id]
  );
  const [[product]] = await db.query("SELECT id,stock,sold FROM products WHERE name=? ORDER BY id DESC LIMIT 1", [
    `Smoke Product ${tag}`,
  ]);

  await db.query("INSERT INTO shipping_addresses(user_id,receiver_name,phone,address,is_default) VALUES (?,?,?,?,1)", [
    user.id,
    "Smoke Receiver",
    "0900000000",
    "Smoke Address",
  ]);
  const [[addr]] = await db.query("SELECT id FROM shipping_addresses WHERE user_id=? ORDER BY id DESC LIMIT 1", [user.id]);

  const base = "http://localhost:8080";
  const smokeProducts = await req("GET", `${base}/api/products`);
  const smokeUsers = await req("GET", `${base}/api/admin/users`);

  await db.query("DELETE FROM cart_items WHERE user_id=?", [user.id]);
  await db.query("UPDATE products SET stock=5,sold=0 WHERE id=?", [product.id]);
  const addSuccess = await req("POST", `${base}/api/cart-items`, { userId: user.id, productId: product.id, quantity: 2 });
  const checkoutSuccess = await req("POST", `${base}/api/orders/checkout/${user.id}`, { shippingAddressId: addr.id });
  const [[succStock]] = await db.query("SELECT stock,sold FROM products WHERE id=?", [product.id]);
  const [succCart] = await db.query("SELECT COUNT(*) c FROM cart_items WHERE user_id=?", [user.id]);
  const [succOrders] = await db.query("SELECT COUNT(*) c FROM orders WHERE user_id=?", [user.id]);

  await db.query("DELETE FROM cart_items WHERE user_id=?", [user.id]);
  await db.query("DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id=?)", [user.id]);
  await db.query("DELETE FROM orders WHERE user_id=?", [user.id]);
  await db.query("UPDATE products SET stock=1,sold=0 WHERE id=?", [product.id]);
  const addInsuff = await req("POST", `${base}/api/cart-items`, { userId: user.id, productId: product.id, quantity: 2 });
  const [[beforeInsuff]] = await db.query("SELECT stock,sold FROM products WHERE id=?", [product.id]);
  const [beforeCart] = await db.query("SELECT COUNT(*) c FROM cart_items WHERE user_id=?", [user.id]);
  const [beforeOrderRows] = await db.query("SELECT id FROM orders WHERE user_id=?", [user.id]);
  const beforeOrderCount = beforeOrderRows.length;
  const checkoutInsuff = await req("POST", `${base}/api/orders/checkout/${user.id}`, { shippingAddressId: addr.id });
  const [[afterInsuff]] = await db.query("SELECT stock,sold FROM products WHERE id=?", [product.id]);
  const [afterCart] = await db.query("SELECT COUNT(*) c FROM cart_items WHERE user_id=?", [user.id]);
  const [afterOrderRows] = await db.query("SELECT id FROM orders WHERE user_id=?", [user.id]);
  const afterOrderCount = afterOrderRows.length;

  await db.query("DELETE FROM cart_items WHERE user_id=?", [user.id]);
  const checkoutEmpty = await req("POST", `${base}/api/orders/checkout/${user.id}`, { shippingAddressId: addr.id });

  const result = {
    setup: { userId: user.id, productId: product.id, addressId: addr.id, categoryId: cat.id, brandId: brand.id },
    smoke: {
      productsStatus: smokeProducts.status,
      usersStatus: smokeUsers.status,
      productCount: Array.isArray(smokeProducts.data) ? smokeProducts.data.length : null,
      userCount: Array.isArray(smokeUsers.data) ? smokeUsers.data.length : null,
    },
    success: {
      addCartStatus: addSuccess.status,
      checkoutStatus: checkoutSuccess.status,
      checkoutBody: checkoutSuccess.data,
      dbAfter: { stock: succStock.stock, sold: succStock.sold, cartCount: succCart[0].c, orderCount: succOrders[0].c },
    },
    insufficientStock: {
      addCartStatus: addInsuff.status,
      checkoutStatus: checkoutInsuff.status,
      checkoutBody: checkoutInsuff.data,
      dbBefore: { stock: beforeInsuff.stock, sold: beforeInsuff.sold, cartCount: beforeCart[0].c, orderCount: beforeOrderCount },
      dbAfter: { stock: afterInsuff.stock, sold: afterInsuff.sold, cartCount: afterCart[0].c, orderCount: afterOrderCount },
    },
    emptyCart: {
      checkoutStatus: checkoutEmpty.status,
      checkoutBody: checkoutEmpty.data,
    },
    rollback: {
      noOrderCreated: beforeOrderCount === afterOrderCount,
      stockUnchanged: beforeInsuff.stock === afterInsuff.stock && beforeInsuff.sold === afterInsuff.sold,
      cartUnchanged: beforeCart[0].c === afterCart[0].c,
    },
  };

  console.log(JSON.stringify(result, null, 2));
  await db.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
