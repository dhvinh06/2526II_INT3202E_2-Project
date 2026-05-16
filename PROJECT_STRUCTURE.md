# PROJECT STRUCTURE — 2526II_INT3202E_2 (ShopVN / DBMS)

Tài liệu mô tả **cấu trúc thư mục và vai trò từng nhóm file** của repository.  
Cập nhật lần cuối: **2026-05-16** (đồng bộ codebase + session changelog)

---

## Cây thư mục (high level)

```
2526II_INT3202E_2 Project/
├── pom.xml                          # Spring Boot 3.3.5, Java 17, JPA, Validation, MySQL, Lombok, spring-dotenv
├── mvnw / mvnw.cmd
├── .mvn/wrapper/
├── api-test.http                    # REST Client: auth + user profile mẫu
├── README-API-USER.md               # Hướng dẫn API User & Auth (tiếng Việt)
├── tmp_checkout_smoke.js            # Smoke test checkout/cart (chỉ máy dev — có credential)
├── PROJECT_CONTEXT.md               # Context chi tiết cho AI và dev
├── PROJECT_STRUCTURE.md             # File này
│
├── src/main/java/com/example/dbms/
├── src/main/resources/
│   └── application.properties      # DB_URL, DB_USER, DB_PASSWORD, app.admin-secret, JPA
├── src/test/java/com/example/dbms/
│   └── ApplicationTests.java
│
└── frontend/
    ├── package.json
    ├── vite.config.js              # port 5173, proxy /api → localhost:8080
    ├── index.html
    ├── vercel.json                 # SPA rewrite → index.html
    ├── tsconfig.json               # (có thể dùng cho tooling; entry app là main.jsx)
    └── src/
```

---

## Backend — `src/main/java/com/example/dbms/`

| Thư mục / file | Mô tả |
|----------------|------|
| `Application.java` | `@SpringBootApplication`, entrypoint |
| `config/CorsConfig.java` | `CorsFilter`: origins `*`, methods GET/POST/PUT/DELETE/OPTIONS, credentials |
| `config/DatabaseInitializer.java` | `CommandLineRunner`: index, MySQL function/procedure/trigger, seed coupons, `seller_id`, fix rating |
| **controller/** | |
| `AuthController.java` | `POST /api/auth/login`, `POST /api/auth/register` |
| `UserController.java` | `GET/PUT /api/users/{id}`, `PUT /api/users/{id}/password` |
| `CustomerController.java` | Shop public + `products/seller/{id}`, cart, orders, **check-coupon**, reviews, **PUT products/{id}/stock** |
| `AdminController.java` | `/api/admin/...`: users, orders, products CRUD + status + **stock**, categories, brands, inventory receipts |
| **service/** | |
| `AuthService.java` | Login/register; `adminSecret` khi ADMIN |
| `UserService.java` | Profile, đổi mật khẩu (plain text) |
| `UserAdminService.java` | List user, đổi `roleId` |
| `ProductService.java` | Browse APPROVED+stock; **getBySeller**; save (PENDING, **sellerId**); **updateStock** (SP); **updateStatus** |
| `CartService.java` | Giỏ: list/upsert/update qty/delete |
| `OrderService.java` | Checkout + **coupon**; **checkCoupon**; pessimistic lock stock |
| `ShippingAddressService.java` | CRUD địa chỉ; validate checkout |
| `ReviewService.java` | Create + list by product; cập nhật rating TB (chưa có delete) |
| `InventoryReceiptService.java` | Phiếu nhập kho + tăng stock |
| `CommonMapper.java` | Map `Product`, `Order` (+ discountAmount, couponCode) |
| **entity/** | |
| `User.java`, `Role.java` | User–Role |
| `Product.java` | Status PENDING/APPROVED/REJECTED; **`seller`** (User) |
| `Category.java` | parent/child, `icon` |
| `Brand.java`, `Supplier.java` | |
| `CartItem.java`, `Order.java`, `OrderItem.java` | Order id String; Order có **discountAmount**, **couponCode** |
| `ShippingAddress.java`, `Review.java` | Review id String |
| `Coupon.java` | id = mã coupon, discountPercent, active |
| `InventoryReceipt.java`, `InventoryReceiptDetail.java` | |
| **repository/** | |
| `ProductRepository.java` | Search; lock; **`CALL sp_update_product_stock`**; **`fn_calculate_discount`** |
| `CouponRepository.java` | **`calculateDiscountedTotal`** qua MySQL function |
| Khác | JpaRepository theo entity |
| **dto/** | |
| `RegisterRequest.java` | role, adminSecret |
| `ProductRequest.java` | brandName, categoryId, stock, **sellerId** |
| `CheckoutRequest.java` | shippingAddressId / newAddress, **couponCode** |
| `InventoryReceiptRequest.java` | Nested line items |
| *(còn lại)* | Auth, cart, profile, password, review, shipping, update order/user |
| **exception/** | `ApiException`, `ErrorCode` (+ **NOT_ALLOWED**), `GlobalExceptionHandler` |

---

## Frontend — `frontend/src/`

| Đường dẫn | Vai trò | Ghi chú |
|-----------|---------|---------|
| `main.jsx` | Entry | `index.css`, render `App` |
| `App.jsx` | Router | `/login`, `/`, `/products`, `/products/:id`, `/cart`, `/checkout`, `/profile`, `/seller`, **`/seller/inventory`**, `/admin` |
| `index.css` | **Stylesheet chính** | Tokens `--c-*`, `.btn-*`, `.pill-input` |
| **context/** | | |
| `AuthContext.jsx` | Auth | `localStorage` key `user` |
| **api/** | | |
| `axios.js` | Axios | `VITE_API_BASE_URL \|\| '/api'` |
| `index.js` | APIs | auth, user, brand, product (**getBySeller**, **updateStock**), category, cart, admin, order (**checkCoupon**), review (**delete** — UI only) |
| `cloudinary.js` | Upload ảnh | |
| **components/** | | |
| `Header.jsx` | Nav | Giỏ → **`/cart`**; Seller/Admin links |
| `Footer.jsx` | Footer | |
| `ProductCard.jsx` | Thẻ SP | |
| `ProductForm.jsx` | Seller form | Cloudinary; **stock**; **sellerId**; `submitting` anti-spam |
| **pages/** | | |
| `HomePage.jsx` | Trang chủ | API only, không mock |
| `ProductListPage.jsx` | Danh sách | `categoryAPI`; refetch `[filters.search, filters.category]` |
| `ProductDetailPage.jsx` | Chi tiết | `image` → `images[]`; cart API; reviews + form; xóa review (API thiếu) |
| `CartPage.jsx` | Giỏ | **Coupon**; navigate checkout + `state.couponCode` |
| `CheckoutPage.jsx` | Thanh toán | Coupon; `newAddress` + **couponCode** |
| `Login.jsx` | Auth | Tab login/register; roles |
| `ProfilePage.jsx` | Hồ sơ | Info / password / orders |
| `SellerPage.jsx` | Seller | `ProductForm`; link **Quản lý kho** |
| `InventoryPage.jsx` | **Kho seller** | `getBySeller` + `updateStock` |
| `AdminPage.jsx` | Admin | Duyệt PENDING |

---

## File có thể xóa

| File | Lý do |
|------|-------|
| `frontend/src/main.ts` | Vite TS demo — entry là `main.jsx` |
| `frontend/src/counter.ts` | Vite TS demo |
| `frontend/src/style.css` | Template Vite — verify không import |
| `frontend/src/styles/global.css` | Verify không import |
| `tmp_checkout_smoke.js` | Smoke dev — không commit public nếu có credential |

**Verify:** `Ctrl+Shift+F` tên file trước khi xóa.

---

## Môi trường chạy

| Layer | Port / config |
|------|----------------|
| Spring Boot | **8080** |
| Vite dev | **5173**, proxy `/api` → `localhost:8080` |
| MySQL | `DB_URL`, `DB_USER`, `DB_PASSWORD` (có thể qua `.env` + **spring-dotenv**) |
| Cloudinary | `frontend/.env`: `VITE_CLOUDINARY_*` |
| Deploy | Vercel (frontend); backend tùy host (Render, v.v.) |

---

*Đồng bộ codebase 2026-05-16.*
