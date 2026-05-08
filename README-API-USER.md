# Hướng Dẫn Sử Dụng API User & Auth

Tài liệu này cung cấp hướng dẫn chi tiết cách gọi các API liên quan đến Xác thực (Authentication) và Quản lý thông tin cá nhân (User Profile) vừa được xây dựng. Tất cả các request và response đều sử dụng định dạng `application/json`.

---

## 1. Auth API (Xác thực)

Các API này không yêu cầu đăng nhập trước. Được sử dụng ở các luồng Đăng ký và Đăng nhập.

### 1.1 Đăng ký tài khoản (Register)
*   **URL:** `POST /api/auth/register`
*   **Chức năng:** Tạo một tài khoản mới. Hệ thống sẽ tự động gán quyền `CUSTOMER`.
*   **Request Body:**
    ```json
    {
      "name": "Nguyen Van A",
      "email": "nguyenvana@example.com",
      "password": "password123"
    }
    ```
*   **Response thành công (200 OK):** Trả về thông tin cơ bản của User.
*   **Lỗi thường gặp:** `409 Conflict` (Email đã có người sử dụng).

### 1.2 Đăng nhập (Login)
*   **URL:** `POST /api/auth/login`
*   **Chức năng:** Xác thực người dùng bằng Email và Mật khẩu.
*   **Request Body:**
    ```json
    {
      "email": "nguyenvana@example.com",
      "password": "password123"
    }
    ```
*   **Response thành công (200 OK):** Trả về thông tin User kèm `id` (Lưu ý lấy ID này để gọi các API Profile ở phía dưới).
    ```json
    {
      "id": 1,
      "name": "Nguyen Van A",
      "email": "nguyenvana@example.com",
      "role": "CUSTOMER"
    }
    ```
*   **Lỗi thường gặp:** `401 Unauthorized` (Sai email hoặc mật khẩu).

---

## 2. User Profile API (Quản lý cá nhân)

Đây là các API dùng để xem và thay đổi thông tin cá nhân. Bạn cần thay thế `{id}` trên đường dẫn bằng ID của người dùng.

### 2.1 Xem thông tin tài khoản (Get Profile)
*   **URL:** `GET /api/users/{id}`
*   **Ví dụ:** `GET /api/users/1`
*   **Chức năng:** Lấy thông tin cá nhân chi tiết.
*   **Response thành công (200 OK):**
    ```json
    {
      "createdAt": "2023-11-20T10:15:30Z",
      "role": "CUSTOMER",
      "name": "Nguyen Van A",
      "id": 1,
      "email": "nguyenvana@example.com"
    }
    ```

### 2.2 Cập nhật thông tin cơ bản (Update Profile)
*   **URL:** `PUT /api/users/{id}`
*   **Chức năng:** Cập nhật Tên và Email của tài khoản.
*   **Request Body:**
    ```json
    {
      "name": "Nguyen Van A (Updated)",
      "email": "nguyenvana.updated@example.com"
    }
    ```
*   **Response thành công (200 OK):** Trả về thông tin sau khi cập nhật.
*   **Lỗi thường gặp:** `409 Conflict` (Nếu cố tình đổi sang một Email đã thuộc về người khác).

### 2.3 Đổi mật khẩu (Change Password)
*   **URL:** `PUT /api/users/{id}/password`
*   **Chức năng:** Đổi mật khẩu. Yêu cầu nhập đúng mật khẩu cũ. Mật khẩu mới phải dài ít nhất 6 ký tự.
*   **Request Body:**
    ```json
    {
      "oldPassword": "password123",
      "newPassword": "newpassword456"
    }
    ```
*   **Response thành công (200 OK):** 
    ```json
    {
      "message": "Password changed successfully"
    }
    ```
*   **Lỗi thường gặp:** `400 Bad Request` (Nếu nhập sai `oldPassword`).

---

## Mẹo Test Nhanh
Nếu bạn dùng **VS Code**, hãy cài extension **REST Client**, sau đó mở file `api-test.http` nằm ở thư mục gốc của dự án này. Bạn có thể bấm nút **Send Request** để chạy thử ngay lập tức mà không cần xài Postman.
