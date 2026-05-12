import axiosInstance from './axiosInstance'

/**
 * Hàm hỗ trợ xử lý lỗi chung cho các API
 */
const handleError = (error) => {
  if (error.response) {
    // Lỗi từ phía server trả về (status code 4xx, 5xx)
    const status = error.response.status;
    const msg = error.response.data?.message || '';

    if (status === 401) throw new Error('Sai thông tin đăng nhập hoặc phiên làm việc đã hết hạn.');
    if (status === 403) throw new Error('Bạn không có quyền thực hiện thao tác này.');
    if (status === 404) throw new Error('Không tìm thấy dữ liệu.');
    if (status === 409) throw new Error(msg || 'Dữ liệu đã tồn tại hoặc bị trùng lặp.');
    if (status >= 500) throw new Error('Hệ thống đang gặp sự cố. Vui lòng thử lại sau.');
    
    throw new Error(msg || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
  } else if (error.request) {
    // Không nhận được phản hồi từ server
    throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.');
  } else {
    // Lỗi setup request
    throw new Error('Đã xảy ra lỗi hệ thống.');
  }
}

export const authAPI = {
  login: async ({ email, password }) => {
    try {
      const res = await axiosInstance.post('/api/auth/login', { email, password })
      return res.data
    } catch (err) { handleError(err) }
  },
  
  register: async ({ name, email, password }) => {
    try {
      const res = await axiosInstance.post('/api/auth/register', { name, email, password })
      return res.data
    } catch (err) { handleError(err) }
  }
}

export const userAPI = {
  getProfile: async (id) => {
    try {
      const res = await axiosInstance.get(`/api/users/${id}`)
      return res.data
    } catch (err) { handleError(err) }
  },

  updateProfile: async (id, data) => {
    try {
      const res = await axiosInstance.put(`/api/users/${id}`, data)
      return res.data
    } catch (err) { handleError(err) }
  },

  changePassword: async (id, data) => {
    try {
      const res = await axiosInstance.put(`/api/users/${id}/password`, data)
      return res.data
    } catch (err) { handleError(err) }
  }
}

export const productAPI = {
  getProducts: async (params) => {
    try {
      const res = await axiosInstance.get('/api/products', { params })
      return res.data
    } catch (err) { handleError(err) }
  },

  getProductById: async (id) => {
    try {
      const res = await axiosInstance.get(`/api/products/${id}`)
      return res.data
    } catch (err) { handleError(err) }
  }
}

export const cartAPI = {
  addToCart: async (data) => {
    try {
      const res = await axiosInstance.post('/api/cart-items', data)
      return res.data
    } catch (err) { handleError(err) }
  },

  getCart: async (userId) => {
    try {
      const res = await axiosInstance.get(`/api/cart-items/${userId}`)
      return res.data
    } catch (err) { handleError(err) }
  }
}

export const orderAPI = {
  checkout: async (userId, data) => {
    try {
      const res = await axiosInstance.post(`/api/orders/checkout/${userId}`, data)
      return res.data
    } catch (err) { handleError(err) }
  }
}
