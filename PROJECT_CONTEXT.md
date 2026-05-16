# PROJECT CONTEXT — ShopVN / 2526II_INT3202E_2 (Hệ thống bán hàng — DBMS)

Tài liệu **context chi tiết** cho AI và dev: kiến trúc, convention, luồng nghiệp vụ, API, schema, MySQL nâng cao, rủi ro và nợ kỹ thuật.  
**Nguồn sự thật:** code trong workspace + `application.properties`, `pom.xml`, `frontend/vite.config.js`.

---

## 0. Changelog

### Session 2026-05-16 (frontend / API wiring)

| File | Thay đổi |
|------|---------|
| `HomePage.jsx` | Xóa `MOCK_PRODUCTS`; fetch thật |
| `ProductListPage.jsx` | Xóa mock/hardcode category; `categoryAPI.getAll()`; deps `[filters.search, filters.category]` |
| `ProductDetailPage.jsx` | Xóa mock; `image` → `images[]`; reviews thật; form đánh giá; `cartAPI.addToCart` |
| `ProductForm.jsx` | Field `stock`; `submitting` anti-spam; reset form |
| `Header.jsx` | Giỏ → `/cart` |
| `CartPage.module.css` | Tokens `--c-primary` |
| `api/index.js` | `reviewAPI.delete` (UI) |

### Session sau (DBMS + seller + coupon) — **mới trong codebase**

| Thành phần | Thay đổi |
|------------|---------|
| `DatabaseInitializer.java` | Index, `fn_calculate_discount`, `sp_update_product_stock`, trigger `sold`, seed `GIAM10`/`GIAM20`, cột `seller_id` |
| `Coupon` + `CouponRepository` | Giảm giá checkout qua MySQL function |
| `Order` | `discountAmount`, `couponCode` |
| `Product` | Quan hệ `seller` (User) |
| `ProductService` | `sellerId`, `getBySeller`, `updateStock` (SP), `updateStatus` |
| `OrderService` | `checkCoupon`, áp coupon lúc checkout |
| `CustomerController` | `GET /products/seller/{id}`, `POST /orders/check-coupon/{userId}`, `PUT /products/{id}/stock` |
| `AdminController` | `PUT /admin/products/{id}/stock` |
| `pom.xml` | `spring-dotenv` |
| `InventoryPage.jsx` | Route `/seller/inventory` |
| `CartPage.jsx` / `CheckoutPage.jsx` | UI coupon, truyền mã sang checkout |
| `ProductForm.jsx` | Gửi `sellerId: user.id` |

---

## 1. Tổng quan

| Hạng mục | Giá trị |
|----------|---------|
| **Mục đích** | E-commerce đồ án DBMS: CRUD, giỏ, đặt hàng, coupon, seller/kho, duyệt SP, nhập kho admin, MySQL function/procedure/trigger |
| **Backend** | Java **17**, **Spring Boot 3.3.5**, Web + JPA + Validation |
| **ORM** | Hibernate `ddl-auto=update` |
| **DB** | **MySQL** |
| **Bảo mật** | Không Spring Security / JWT — `userId` trên URL/body + `localStorage` |
| **Frontend** | **React 19**, **Vite 8**, **React Router 7**, **axios** |
| **Package** | `com.example.dbms` |

---

## 2. Ports & HTTP

| Dịch vụ | URL |
|---------|-----|
| API | `http://localhost:8080` |
| Vite | `http://localhost:5173` — proxy `/api` → 8080 |

Axios: `baseURL = VITE_API_BASE_URL || '/api'`. Path trong `api/index.js` **không** có prefix `/api`.

---

## 3. Biến môi trường

### Backend (`application.properties` + `.env` nếu dùng spring-dotenv)

| Key | Ý nghĩa |
|-----|---------|
| `DB_URL`, `DB_USER`, `DB_PASSWORD` | MySQL |
| `app.admin-secret` | Đăng ký role ADMIN |
| `spring.jpa.hibernate.ddl-auto` | `update` |
| `spring.jpa.show-sql` | `true` |

### Frontend (`frontend/.env`)

| Biến | Dùng cho |
|------|----------|
| `VITE_API_BASE_URL` | Base API (mặc định `/api`) |
| `VITE_CLOUDINARY_CLOUD_NAME` | Upload ảnh |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Unsigned preset |

---

## 4. MySQL nâng cao (`DatabaseInitializer`)

Chạy khi Spring Boot start (bỏ qua lỗi nếu đã tồn tại):

| # | Thành phần | Mô tả |
|---|------------|--------|
| 1 | Index `idx_product_name` | Tìm theo tên SP |
| 2 | Function `fn_calculate_discount(price, percent)` | Tính giá sau giảm |
| 3 | Procedure `sp_update_product_stock(id, delta)` | `UPDATE products SET stock = stock + delta` |
| 4 | Trigger `trg_after_order_item_insert` | Sau INSERT `order_items` → cộng `products.sold` |
| 5 | Seed coupons | `GIAM10` (10%), `GIAM20` (20%) |
| 6 | `products.seller_id` | FK → `users` |
| 7 | Populate seller | Gán seller ngẫu nhiên cho SP cũ |
| 8 | Clear fake rating | `rating = 0` nếu không có review |

**Coupon mẫu:** `GIAM10`, `GIAM20`.

---

## 5. Domain & schema

### Bảng / entity chính

- **users** ↔ **roles** (`CUSTOMER`, `SELLER`, `ADMIN`)
- **categories** (parent_id, icon emoji), **brands**
- **products**: price, image, rating, sold, stock, category, brand, **status**, **seller_id**
- **coupons**: id (mã), discount_percent, active
- **cart_items**: snapshot giá/tên/ảnh
- **orders**: id String `ORD-...`, total_amount, status, **discount_amount**, **coupon_code**
- **order_items**: product_id lưu **String** trong entity
- **shipping_addresses**, **reviews** (id String `RVW-...`)
- **inventory_receipts** + **details**

### Review API response

`id`, `productId`, `userId`, `userName`, `rating`, `comment`, `createdAt` (ISO → `toLocaleDateString('vi-VN')`).

---

## 6. API đầy đủ

### 6.1 Auth — `/api/auth`

| Method | Path | Body |
|--------|------|------|
| POST | `/login` | email, password |
| POST | `/register` | name, email, password, role?, adminSecret? |

Response: `{ id, name, email, role }`.

### 6.2 Users — `/api/users`

| Method | Path |
|--------|------|
| GET | `/{id}` |
| PUT | `/{id}` |
| PUT | `/{id}/password` |

### 6.3 Shop — `/api` (`CustomerController`)

| Method | Path | Ghi chú |
|--------|------|---------|
| GET | `/products` | APPROVED + stock > 0; categoryId, brandId, search, page, size |
| GET | `/products/{id}` | Trả `image` (string) — frontend wrap `images[]` |
| GET | `/products/seller/{sellerId}` | SP của seller (mọi status trong query) |
| GET | `/categories`, `/brands` | |
| GET/POST/PUT/DELETE | `/cart-items/...` | |
| POST | `/orders/checkout/{userId}` | `CheckoutRequest`: address + **couponCode** |
| POST | `/orders/check-coupon/{userId}` | Body `{ "code": "GIAM10" }` |
| GET | `/orders/{orderId}`, `/orders/user/{userId}` | Order map có discountAmount, couponCode |
| GET/POST/PUT/DELETE | `/shipping-addresses/...` | |
| POST | `/reviews` | |
| GET | `/reviews/product/{productId}` | |
| PUT | `/products/{id}/stock` | Body `{ quantityChange, userId }` — seller phải đúng owner |

### 6.4 Admin — `/api/admin`

**Không check role server-side** — chỉ ẩn UI.

| Method | Path |
|--------|------|
| GET | `/users` |
| PUT | `/users/{id}/role` |
| GET | `/orders` |
| PUT | `/orders/{id}/status` |
| POST/PUT/DELETE | `/products`, `/products/pending`, `/products/{id}/status` |
| PUT | `/products/{id}/stock` |
| CRUD | `/categories`, `/brands` |
| POST/GET | `/inventory-receipts`, `/inventory-receipts/{id}` |

### 6.5 Lỗi

`GlobalExceptionHandler` → `{ timestamp, code, message }`.  
`ErrorCode`: NOT_FOUND, VALIDATION_FAILED, INSUFFICIENT_STOCK, EMPTY_CART, BAD_REQUEST, INTERNAL_ERROR, UNAUTHORIZED, CONFLICT, **NOT_ALLOWED**.

---

## 7. Logic nghiệp vụ

### 7.1 Checkout (`OrderService`)

1. Giỏ không rỗng; địa chỉ (id hoặc `newAddress`).
2. Pessimistic lock stock.
3. Tính subtotal; nếu **couponCode** → `fn_calculate_discount` → `finalTotal`, `discountAmount`.
4. Tạo order; trừ stock; **Java cộng sold**; insert order_items; xóa cart.

### 7.2 Check coupon

`POST /orders/check-coupon/{userId}` — tính trên giỏ hiện tại, trả `valid`, `discountPercent`, `originalTotal`, `discountedTotal`, `discountAmount`.

### 7.3 Seller → Admin

1. `POST /api/admin/products` + `sellerId` → **PENDING**.
2. Admin `PUT .../status?status=APPROVED|REJECTED`.
3. Buyer chỉ thấy APPROVED + stock > 0.

### 7.4 Seller nhập kho

`PUT /api/products/{id}/stock` → `CALL sp_update_product_stock` — chỉ seller của SP (403 nếu sai).

### 7.5 Review

Một review / user / product; cập nhật `Product.rating` trung bình.

### 7.6 Auth

Plaintext password. ADMIN cần `adminSecret` = `app.admin-secret`.

---

## 8. Frontend — routes ↔ API

| Route | Component | API |
|-------|-----------|-----|
| `/login` | `Login.jsx` | authAPI |
| `/` | `HomePage.jsx` | products, categories |
| `/products` | `ProductListPage.jsx` | products + categories; refetch filter |
| `/products/:id` | `ProductDetailPage.jsx` | product, reviews, cart |
| `/cart` | `CartPage.jsx` | cart, **checkCoupon** → checkout state |
| `/checkout` | `CheckoutPage.jsx` | cart, checkout + coupon |
| `/profile` | `ProfilePage.jsx` | user, orders |
| `/seller` | `SellerPage.jsx` | createProduct + sellerId |
| `/seller/inventory` | `InventoryPage.jsx` | getBySeller, updateStock |
| `/admin` | `AdminPage.jsx` | pending, update status |

**Header:** icon giỏ → `/cart`.  
**Design tokens:** `--c-primary`, `--c-primary-focus`, `--c-hairline` — không dùng `--primary`, `--gray-*`.

---

## 9. Tài liệu trong repo

| File | Mục đích |
|------|----------|
| `README-API-USER.md` | Auth + User API |
| `api-test.http` | REST Client mẫu |
| `tmp_checkout_smoke.js` | Smoke checkout — dev only |
| `PROJECT_STRUCTURE.md` | Cấu trúc thư mục |
| `PROJECT_CONTEXT.md` | File này |

---

## 10. Known issues / technical debt

| Ưu tiên | Vấn đề |
|---------|--------|
| Bug | **`sold` có thể cộng 2 lần** — Java trong checkout + trigger `trg_after_order_item_insert` |
| Bug | Trigger so sánh `products.id` với `order_items.product_id` (String vs INT) — cần DB đồng nhất |
| API | **`reviewAPI.delete`** trên frontend — **backend chưa có** `DELETE /api/reviews/{id}` |
| Bảo mật | `/api/admin/*` public; plaintext password; không verify userId vs session |
| UX | `ProductDetailPage` dùng `originalPrice` — API không trả |
| UX | Checkout không dùng sổ `shippingAddressId` có sẵn |
| Repo | `tmp_checkout_smoke.js` có credential — không public |

### Đã xử lý

- Mock frontend → API thật  
- Add to cart → `cartAPI`  
- Header giỏ → `/cart`  
- Seller stock + anti-spam submit  
- Form đánh giá + list reviews  
- ProductList refetch + category từ API  
- **Coupon** Cart/Checkout + backend  
- **InventoryPage** + seller_id + SP  

---

## 11. Convention (AI / refactor)

1. `api/index.js`: path không prefix `/api`.
2. Dev proxy Vite; prod cần `VITE_API_BASE_URL` hoặc cùng origin.
3. Ảnh: Cloudinary URL → `products.image`; UI `images = [image]`.
4. Seller tạo SP qua `/api/admin/products` (không có SellerController riêng).
5. Coupon code uppercase khi lookup (`trim().toUpperCase()`).
6. Stock seller: luôn gửi `userId` trong body `updateStock`.

---

*Cập nhật 2026-05-16 — đồng bộ `c:\Users\vinhh\Downloads\files\` + codebase hiện tại.*
