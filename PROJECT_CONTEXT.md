# PROJECT CONTEXT — ShopVN / 2526II_INT3202E_2 (Hệ thống bán hàng — DBMS)

Tài liệu **context chi tiết** cho AI và dev: kiến trúc, convention, luồng nghiệp vụ, API, schema, rủi ro và nợ kỹ thuật.  
**Nguồn sự thật:** code trong workspace `2526II_INT3202E_2 Project` + các file như `application.properties`, `pom.xml`, `frontend/vite.config.js`.

---

## 1. Tổng quan

| Hạng mục | Giá trị |
|----------|---------|
| **Mục đích** | E-commerce đồ án/thuyết trình DBMS: CRUD, giỏ, đặt hàng, phân quyền vai trò, duyệt sản phẩm seller, nhập kho admin |
| **Backend** | Java **17**, **Spring Boot 3.3.5**, Spring Web + Data JPA + Validation |
| **ORM** | Hibernate (`spring.jpa.hibernate.ddl-auto=update`) |
| **DB** | **MySQL** (driver `mysql-connector-j`) |
| **Bảo mật** | **Không** Spring Security, **không** JWT/session server — chỉ frontend + `userId` trên URL/body |
| **Frontend** | **React 19** + **Vite 8**, **React Router 7**, **axios** |
| **Package backend** | `com.example.dbms` |
| **Artifact Maven** | `DBMS` (group `com.example`) |

---

## 2. Ports & luồng HTTP

| Dịch vụ | Mặc định |
|---------|----------|
| API Spring Boot | `http://localhost:8080` |
| Dev Vite | `http://localhost:5173` |
| Proxy dev | Request từ browser tới **`/api/*`** được Vite chuyển tới **`http://localhost:8080`** (`frontend/vite.config.js`) |

Axios (`frontend/src/api/axios.js`): `baseURL = import.meta.env.VITE_API_BASE_URL || '/api'`.  
Các hàm trong `api/index.js` dùng path **tương đối không có** `/api` (vì base đã là `/api`).

---

## 3. Biến môi trường / bí mật

### Backend (`src/main/resources/application.properties`)

| Key | Ý nghĩa |
|-----|---------|
| `spring.datasource.url` | `${DB_URL}` |
| `spring.datasource.username` | `${DB_USER}` |
| `spring.datasource.password` | `${DB_PASSWORD}` |
| `app.admin-secret` | Chuỗi bí mật khi đăng ký role **ADMIN** (trong repo mẫu là giá trị cụ thể — **đổi trên máy deploy**, không chia sẻ công khai) |
| `spring.jpa.hibernate.ddl-auto` | `update` |
| `spring.jpa.show-sql` | `true` |

### Frontend (`frontend/.env`, prefix `VITE_`)

| Biến | Dùng cho |
|------|----------|
| `VITE_API_BASE_URL` | (Tuỳ chọn) đổi base API; không set thì `/api` |
| `VITE_CLOUDINARY_CLOUD_NAME` | Upload ảnh |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Unsigned preset Cloudinary |

---

## 4. Cấu trúc codebase (đã rút gọn)

### 4.1 Backend — lớp và trách nhiệm

- **entity:** map 1–1 các bảng chính (User, Role, Product, Category, Brand, CartItem, Order, OrderItem, ShippingAddress, Review, Supplier, InventoryReceipt, InventoryReceiptDetail).
- **repository:** Spring Data JPA; `ProductRepository` có `@Query` search + pessimistic lock cho checkout/nhập kho.
- **service:** nghiệp vụ và format `Map`/entity trả về controller.
- **controller:** chỉ routing + validation input.
- **dto:** request shapes + annotation validate.
- **exception:** `ApiException` + `GlobalExceptionHandler` trả JSON `{timestamp, code, message}`.

### 4.2 Frontend — luồng UI

- **AuthContext:** lưu `{ id, name, email, role }` vào **`localStorage`** (`key`: `user`).
- **Routing:** `/login` ngoài layout; các trang khác trong layout có Header/Footer.
- **Ảnh:** Seller upload ảnh → Cloudinary URL → backend lưu field `Product.image`.

Chi tiết từng file: xem **`PROJECT_STRUCTURE.md`** trong repo.

---

## 5. Domain & schema (theo entity / thực tế Hibernate)

### 5.1 Bảng chính (tên logical)

- **users**: id, name, email, password, created_at, role_id → **roles**.
- **roles**: id, name, description — tên role: **`CUSTOMER`**, **`SELLER`**, **`ADMIN`** (cần data seed trong DB).
- **categories**: id, name, slug, parent_id (self FK), icon (emoji string).
- **brands**: id, name, description.
- **products**: id, name, price, image, description, rating (BigDecimal), sold, stock, category_id, brand_id, **status** enum string: **`PENDING` | `APPROVED` | `REJECTED`**.
- **cart_items**: user_id, product_id, snapshot name/price/image, quantity, created_at.
- **orders**: **id kiểu String** (generated `ORD-...`), user_id, total_amount, status (String), created_at.
- **order_items**: order_id, product_id (stored as **String** in entity), snapshot fields.
- **shipping_addresses**: user_id, receiver_name, phone, address, is_default, created_at.
- **reviews**: **id String** (prefix `RVW-...`), product_id, user_id, rating, comment, created_at — **unique theo (product,user)** trong service.
- **suppliers**, **inventory_receipts**, **inventory_receipt_details**: nhập kho, tăng stock.

### 5.2 Ghi chú schema / Hibernate

- JPA không khớp 100% ví dụ cũ nếu DB được tạo tay: Hibernate `update` có thể bổ sung cột nhưng **không** an toàn cho production migrate.
- `OrderItem.productId` là **String**; OrderService set `String.valueOf(product.id)`.

---

## 6. API — đầy đủ theo Controller

### 6.1 Auth — base `/api/auth`

| Method | Path | Body |
|--------|------|------|
| POST | `/login` | `AuthRequest`: email, password |
| POST | `/register` | `RegisterRequest`: name, email, password, optional `role` (default CUSTOMER), `adminSecret` nếu ADMIN |

Phản hồi login/register: **`{ id, name, email, role }`** (role là **tên** role).

### 6.2 User profile — `/api/users`

| Method | Path | Ghi chú |
|--------|------|---------|
| GET | `/{id}` | Profile có `createdAt`, `role` |
| PUT | `/{id}` | `UpdateProfileRequest`: name, email — conflict email → 409 |
| PUT | `/{id}/password` | `ChangePasswordRequest`: old/new password |

### 6.3 Shop (customer) — base `/api` — `CustomerController`

| Method | Path | Params / body |
|--------|------|----------------|
| GET | `/products` | `categoryId`, `brandId`, `search`, `page`, `size` — **repo filter `status = APPROVED` và `stock > 0`** |
| GET | `/products/{id}` | Chi tiết (không filter status trong code — có thể xem SP không APPROVED nếu biết id) |
| GET | `/categories` | Full list category entities |
| GET | `/brands` | Full list brands |
| GET | `/cart-items/user/{userId}` | |
| POST | `/cart-items` | `CartItemUpsertRequest` |
| PUT | `/cart-items/{id}` | `UpdateQuantityRequest` — quantity 0 → xóa |
| DELETE | `/cart-items/{id}` | |
| POST | `/orders/checkout/{userId}` | Optional `CheckoutRequest`: `shippingAddressId` hoặc `newAddress` |
| GET | `/orders/{orderId}` | |
| GET | `/orders/user/{userId}` | |
| GET | `/shipping-addresses/user/{userId}` | |
| POST | `/shipping-addresses` | `ShippingAddressRequest` |
| PUT | `/shipping-addresses/{id}` | |
| DELETE | `/shipping-addresses/{id}` | |
| POST | `/reviews` | `ReviewRequest` |
| GET | `/reviews/product/{productId}` | |

### 6.4 Admin — base `/api/admin` — `AdminController`

**Lưu ý cực quan trọng:** không có kiểm tra role phía server; **ai gọi được URL đều dùng được** (đồ án chấp nhận được). Frontend chỉ **ẩn route** `/admin`/`/seller`.

| Method | Path | Ý |
|--------|------|---|
| GET | `/users` | List users + role info |
| PUT | `/users/{id}/role` | Body `UpdateUserRoleRequest`: roleId |
| GET | `/orders` | Query `status` optional |
| PUT | `/orders/{id}/status` | Body `UpdateOrderStatusRequest` |
| POST | `/products` | Tạo từ `ProductRequest`; status **PENDING** khi insert mới trong `ProductService` |
| PUT | `/products/{id}` | Cập nhật |
| DELETE | `/products/{id}` | Xóa |
| GET | `/products/pending` | Danh sách `PENDING` |
| PUT | `/products/{id}/status` | Query `status=APPROVED|REJECTED|...` (enum Product.Status); `valueOf` — sai chuỗi sẽ lỗi |
| GET/POST | `/categories` | CRUD dùng `Category` entity trực tiếp |
| PUT/DELETE | `/categories/{id}` | |
| GET/POST | `/brands` | CRUD `Brand` |
| PUT/DELETE | `/brands/{id}` | |
| POST | `/inventory-receipts` | `InventoryReceiptRequest` + chi tiết; tăng stock + lock |
| GET | `/inventory-receipts` | List |
| GET | `/inventory-receipts/{id}` | Chi tiết có items |

### 6.5 Lỗi chuẩn

`GlobalExceptionHandler`:

- `ApiException` → status + body `code` = `ErrorCode.name()`.
- `MethodArgumentNotValidException` → 400 `VALIDATION_FAILED`.
- Fallback `Exception` → 500 `INTERNAL_ERROR`.

---

## 7. Logic nghiệp vụ nổi bật

### 7.1 Đặt hàng (`OrderService.checkout`)

1. Kiểm tra user, giỏ không rỗng.
2. Địa chỉ: hoặc `shippingAddressId` của user hoặc tạo từ `newAddress`.
3. `findAllByIdInForUpdate` — pessimistic lock tồn kho.
4. Kiểm tra stock đủ; tính tổng tiền.
5. Sinh **`order.id`** kiểu `ORD-yyyyMMdd-HHmmss-XXX`; tránh trùng bằng vòng `existsById`.
6. Trừ stock, tăng sold, lưu `OrderItem`.
7. `deleteByUserId` — xóa toàn bộ cart của user sau checkout.

Checkout dùng `@Transactional` (Spring `transaction.annotation`).

### 7.2 Đánh giá (`ReviewService`)

- Một user chỉ một review / product (`findByProductIdAndUserId`).
- Sau khi lưu, tính **trung bình rating** các review của product → cập nhật `Product.rating`.

### 7.3 Sản phẩm Seller → Admin

1. Seller gọi `POST /api/admin/products` qua **`ProductForm`** (frontend không có SellerController backend).
2. `ProductService.save(..., id=null)` set **status=PENDING**, sold=0, stock từ request hoặc 0.
3. Admin vào **`AdminPage`**: `GET /api/admin/products/pending`, duyệt `PUT .../status?status=APPROVED|REJECTED`.
4. `GET /api/products` chỉ trả **`APPROVED`** và **`stock > 0`**.

### 7.4 AuthService — đăng ký ADMIN

- `RegisterRequest.role` upper-case; whitelist `CUSTOMER`, `SELLER`, `ADMIN`.
- ADMIN: **`adminSecret` phải khớp** `app.admin-secret`.

### 7.5 Mật khẩu

- **Lưu và so sánh dạng plain text** trong DB — chỉ phù hợp đồ án; production cần hash (BCrypt, v.v.).

---

## 8. Frontend — mapping màn hình ↔ API

| Route | Component | API chính | Ghi chú |
|-------|-----------|-----------|---------|
| `/login` | `Login.jsx` | `authAPI.login`, `register` | Role + admin secret |
| `/` | `HomePage.jsx` | `productAPI.getProducts`, `categoryAPI.getAll` | Fallback `MOCK_PRODUCTS`; category cha/con split ở client |
| `/products` | `ProductListPage.jsx` | `productAPI.getProducts` (deps `[]` — không refetch khi query đổi) | Sidebar category dùng **slug cứng** có thể **không** khớp `categoryId` từ Home |
| `/products/:id` | `ProductDetailPage.jsx` | `productAPI.getProductById` | Mock merge; **Add to cart = alert**, không POST cart |
| `/cart` | `CartPage.jsx` | `cartAPI.*` | Cần login |
| `/checkout` | `CheckoutPage.jsx` | `cartAPI.getCart`, `orderAPI.checkout` | Gửi `newAddress` (không dùng `shippingAddressId` từ sổ địa chỉ) |
| `/profile` | `ProfilePage.jsx` | `userAPI`, `orderAPI` | Tab đơn hàng; chỗ đổi profile/password có **`try/catch` nuốt lỗi API** và vẫn báo success (cần review nếu muốn hành vi chặt) |
| `/seller` | `SellerPage.jsx` | `categoryAPI`, `brandAPI`, `productAPI.createProduct` | Cloudinary + form |
| `/admin` | `AdminPage.jsx` | `adminAPI` pending + update status | Chỉ UI role ADMIN |

UX:

- **`Header`** link icon giỏ trỏ **`/checkout`** (không phải `/cart`).
- **Deploy SPA:** `frontend/vercel.json` rewrite mọi path về `index.html`.

---

## 9. Tài liệu & script trong repo

| File | Mục đích |
|------|----------|
| `README-API-USER.md` | Hướng dẫn Auth + User REST |
| `api-test.http` | Mẫu REST Client (localhost:8080) |
| `tmp_checkout_smoke.js` | Kiểm thử đường ống checkout/cart có DB `warm_editorial` (hostname/user/pass trong script — chỉ máy dev) |
| **`PROJECT_STRUCTURE.md`** | **Cây thư mục + mô tả file** chi tiết |

---

## 10. CORS

`CorsConfig` đăng ký `CorsFilter`: allowed origin patterns `*`, credentials `true`. Kết hợp wildcard + credentials trong spec browser có caveat — dev cross-origin có thể cần chỉnh.

---

## 11. Known issues / technical debt

| Ưu tiên | Vấn đề |
|---------|--------|
| Bảo mật | Không authentication server; `/api/admin/*` public |
| Bảo mật | Plaintext password |
| Nhất quán UI | Product detail không gọi `cartAPI`; header đi `/checkout` thay vì `/cart` |
| Frontend | Product list không refetch khi `searchParams` đổi (chỉ filter local trên snapshot đầu) |
| Frontend | Category filter sidebar vs API `categoryId` có thể lệch |
| Backend | `PUT /api/users/...`: không verify id trùng với “session”; user A có thể gọi user B's id |
| Repo | `.tmp-node`, `counter.ts`, `main.ts`, `style.css` / `styles/global.css` có thể thừa — nên dọn định kỳ |

### ĐÃ xử lý / không còn đúng với codebase cũ

- ~~ProductList/ProductDetail không gọi API~~ → **Đã có** `productAPI` (kèm mock fallback/detail).
- ~~OrderService transactional~~ → **Đã có** `@Transactional` trên checkout.
- Product entity **không có** method `calculateDiscount()` hay field `discountPrice` trong code hiện tại — chiết khấu trên UI dùng field mock `originalPrice` ở frontend.

---

## 12. Convention làm việc (nhớ cho AI/refactor)

1. **`api/index.js`:** path không bắt đầu bằng `/api`; instance axios đã gắn base.
2. **Proxy:** chỉ trong `npm run dev`; production cần cùng origin hoặc `VITE_API_BASE_URL`.
3. **Cloudinary:** URL string lưu DB cột `products.image`; `CommonMapper` duplicate key `images` cùng `image` để frontend linh hoạt.
4. **Roles:** Seller dùng chung endpoint admin cho create product — thiết kế đồ án, không đúng mô hình production.

---

*Tài liệu được cập nhật để khớp code trong project; có thể mở rộng nhánh `inventory_receipts` hoặc tách Seller API khi codebase phát triển.*
