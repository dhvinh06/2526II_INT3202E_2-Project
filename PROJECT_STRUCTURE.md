# PROJECT STRUCTURE — 2526II_INT3202E_2 (ShopVN / DBMS)

Tài liệu mô tả **cấu trúc thư mục và vai trò từng nhóm file** của repository (không liệt kê `node_modules`, `.tmp-node`, build output).

---

## Cây thư mục (high level)

```
2526II_INT3202E_2 Project/
├── pom.xml                          # Maven: Spring Boot 3.3.5, Java 17, JPA, Validation, MySQL, Lombok
├── mvnw / mvnw.cmd                  # Maven Wrapper
├── .mvn/wrapper/                    # Cấu hình maven-wrapper
├── api-test.http                    # REST Client: auth + user profile mẫu
├── README-API-USER.md               # Hướng dẫn API User & Auth (tiếng Việt)
├── tmp_checkout_smoke.js            # Script smoke test checkout/cart (mysql2 + fetch; DB local)
├── PROJECT_STRUCTURE.md             # File này
│
├── src/main/java/com/example/dbms/  # Backend Spring Boot (package gốc)
├── src/main/resources/
│   └── application.properties       # DB_URL, DB_USER, DB_PASSWORD, app.admin-secret, JPA
├── src/test/java/com/example/dbms/  # Test (smoke, không cần DB)
│
└── frontend/                        # SPA React + Vite
    ├── package.json
    ├── vite.config.js               # port 5173, proxy /api → localhost:8080
    ├── index.html                   # ShopVN title, mount #root
    ├── vercel.json                  # SPA rewrite → index.html
    ├── .gitignore
    └── src/
```

---

## Backend — `src/main/java/com/example/dbms/`

| Thư mục / file | Mô tả |
|----------------|------|
| `Application.java` | `@SpringBootApplication`, entrypoint |
| `config/CorsConfig.java` | `CorsFilter`: origins `*`, methods GET/POST/PUT/DELETE/OPTIONS, credentials |
| **controller/** | REST API, prefix theo file |
| `AuthController.java` | `POST /api/auth/login`, `POST /api/auth/register` |
| `UserController.java` | `GET/PUT /api/users/{id}`, `PUT /api/users/{id}/password` |
| `CustomerController.java` | Public shop: products, categories, brands, cart, orders, addresses, reviews (`/api/...`) |
| `AdminController.java` | ` /api/admin/...`: users, orders, products CRUD + status + pending, categories, brands, inventory receipts |
| **service/** | Logic nghiệp vụ + map DTO/map response |
| `AuthService.java` | Login/register, role CUSTOMER/SELLER/ADMIN, kiểm tra `adminSecret` khi ADMIN |
| `UserService.java` | Profile, đổi mật khẩu (plain compare) |
| `UserAdminService.java` | Danh sách user, đổi `roleId` |
| `ProductService.java` | Browse (theo APPROVED + stock), get, save/create/update (PENDING khi create), delete, list theo status |
| `CartService.java` | Giỏ: list/upsert/update qty/delete |
| `OrderService.java` | Checkout có khóa pessimistic stock, tạo order + order items, list theo user, admin list/filter status, đổi status |
| `ShippingAddressService.java` | CRUD địa chỉ; validate cho checkout |
| `ReviewService.java` | Một review / user-product; cập nhật rating TB sản phẩm |
| `InventoryReceiptService.java` | Phiếu nhập kho + tăng stock (lock product) |
| `CommonMapper.java` | Map `Product`, `Order` → `Map` JSON-friendly |
| **entity/** | JPA entities map bảng MySQL (`users`, `products`, ...) |
| `User.java`, `Role.java` | User–Role many-to-one |
| `Product.java` | Enum `Status`: PENDING, APPROVED, REJECTED |
| `Category.java` | Parent–child (`parent`), `parentId`, `icon` |
| `Brand.java`, `Supplier.java` | Thương hiệu, nhà cung cấp |
| `CartItem.java`, `Order.java`, `OrderItem.java` | Giờ hàng và đơn (order id `String`) |
| `ShippingAddress.java`, `Review.java` | Địa chỉ giao hàng, đánh giá (id String) |
| `InventoryReceipt.java`, `InventoryReceiptDetail.java` | Nhập kho + chi tiết |
| **repository/** | Spring Data `JpaRepository` + `@Query` tùy chỉnh |
| `ProductRepository.java` | Search có filter APPROVED + stock; `findByIdForUpdate` / `findAllByIdInForUpdate` |
| Khác | Repository chuẩn theo entity |
| **dto/** | Request body validation (`jakarta.validation`) |
| `RegisterRequest.java` | `role`, `adminSecret` (ADMIN) |
| `ProductRequest.java` | `brandName` (text), `categoryId`, `stock`, ... |
| `CheckoutRequest.java` | `shippingAddressId` hoặc `newAddress` |
| `InventoryReceiptRequest.java` | Nested items: productId, quantity, unitPrice |
| *(còn lại)* | Auth, cart, profile, password, review, shipping, update order/user |
| **exception/** | `ApiException`, `ErrorCode`, `GlobalExceptionHandler` (@RestControllerAdvice) |

---

## Backend — resources & test

| File | Mô tả |
|------|------|
| `application.properties` | `spring.application.name`; `DB_URL` / `DB_USER` / `DB_PASSWORD`; `app.admin-secret`; JPA `ddl-auto=update`, `show-sql` |
| `ApplicationTests.java` | Test smoke rỗng (không cần DB) |

---

## Frontend — `frontend/src/`

| Đường dẫn | Vai trò |
|-----------|---------|
| `main.jsx` | `createRoot`, `StrictMode`, import `./index.css`, render `App` |
| `App.jsx` | `BrowserRouter`, `AuthProvider`, layout có `Header`/`Footer`; routes: `/login`, `/`, `/products`, `/products/:id`, `/cart`, `/checkout`, `/profile`, `/seller`, `/admin` |
| `index.css` | Design tokens (.t-*, .btn-*, `.pill-input`, global reset) — **stylesheet chính** |
| `style.css` | Template Vite (nhiều rule cho `#app` demo) — **có thể không được import** |
| `styles/global.css` | Theme Inter / cam — **có thể không được import** |
| **context/** | |
| `AuthContext.jsx` | `user` từ `localStorage`; `login` / `logout` |
| **api/** | |
| `axios.js` | `baseURL`: `import.meta.env.VITE_API_BASE_URL \|\| '/api'` |
| `index.js` | `authAPI`, `userAPI`, `brandAPI`, `productAPI`, `categoryAPI`, `cartAPI`, `adminAPI`, `orderAPI`, `reviewAPI`; path **không** có prefix `/api` (axios đã có base `/api`) |
| `cloudinary.js` | Upload ảnh unsigned preset → `secure_url` |
| **components/** | |
| `Header.jsx` / `*.module.css` | Nav, search, Seller/Admin theo role; icon giỏ link **`/checkout`** |
| `Footer.jsx` / `*.module.css` | Link footer |
| `ProductCard.jsx` / `*.module.css` | Thẻ sản phẩm (giá VND, rating, sold); hỗ trợ mock `originalPrice` |
| `ProductForm.jsx` / `*.module.css` | Seller: Cloudinary + `POST /admin/products` |
| **pages/** | |
| `HomePage.jsx` | Hero, categories tree, fetch `productAPI` + `categoryAPI`, fallback `MOCK_PRODUCTS` |
| `ProductListPage.jsx` | Query string (search/category/sort), fetch products **một lần** (`useEffect` deps `[]`), filter client-side có slug `CATEGORIES` (**lệch** với `categoryId` số của API nếu dùng chung URL) |
| `ProductDetailPage.jsx` | `getProductById`; merge MOCK; **“Thêm giỏ” = alert**, chưa gọi `cartAPI`; “Mua ngay” → `/checkout` |
| `CartPage.jsx` | Giỏ thật qua API, cần login |
| `CheckoutPage.jsx` | Địa chỉ form → `newAddress` + `orderAPI.checkout` |
| `Login.jsx` | Tab login/register, role segment, ADMIN secret |
| `ProfilePage.jsx` | Info / password / đơn hàng (`orderAPI`) |
| `SellerPage.jsx` | Chỉ SELLER, embed `ProductForm` |
| `AdminPage.jsx` | Chỉ ADMIN, pending products, duyệt/từ chối |
| `*.module.css` (pages/components) | Style scoped theo component |

### File phụ / template có thể thừa

- `frontend/src/main.ts`, `frontend/src/counter.ts` — thường là **artifact Vite/TS demo**; entry thực tế là `main.jsx`.

---

## Tài nguyên tĩnh

| Đường dẫn | Ghi chú |
|-----------|---------|
| `frontend/public/icons.svg` | (nếu dùng) asset public |
| `index.html` (frontend) | Favicon `/favicon.svg` (file có thể cần tự thêm trong `public/`) |

---

## Môi trường chạy

| Layer | Port / config |
|------|----------------|
| Spring Boot | Mặc định **8080** |
| Vite dev | **5173**, proxy **`/api` → http://localhost:8080** |
| MySQL | Qua env `DB_URL`, `DB_USER`, `DB_PASSWORD` |
| Cloudinary | `frontend/.env`: `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET` |

---

## Phụ lục: Đếm file logic (approx)

- **Java (main):** ~58 class trong `src/main/java/...`
- **Java (test):** 1 file
- **Frontend app:** ~36 file trong `frontend/src/` (jsx/css; chưa kể `.ts` demo)

---

*Đồng bộ với trạng thái codebase tại thời điểm tạo tài liệu; không mô tả nội dung `node_modules`.*
