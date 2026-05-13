import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { orderAPI } from '../api'
import styles from './CheckoutPage.module.css'

// MOCK CART DATA
const MOCK_CART = [
  { id: 1, name: 'Áo thun nam basic oversize Hàn Quốc', price: 149000, quantity: 2, image: 'https://picsum.photos/seed/pr1/100/100' },
  { id: 4, name: 'Bình giữ nhiệt inox 316 500ml', price: 245000, quantity: 1, image: 'https://picsum.photos/seed/pr4/100/100' }
]

const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

export default function CheckoutPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Guard: Not logged in
  if (!user) {
    return <Navigate to="/login" replace />
  }

  const [form, setForm] = useState({
    receiverName: user.name || '',
    phone: '',
    address: ''
  })
  const [errors, setErrors] = useState({})
  const [paymentMethod, setPaymentMethod] = useState('COD')
  
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [orderId, setOrderId] = useState('')

  // Calculations
  const subtotal = MOCK_CART.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingFee = subtotal >= 500000 ? 0 : 30000
  const total = subtotal + shippingFee

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // Clear error when typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const errs = {}
    if (!form.receiverName.trim()) {
      errs.receiverName = 'Vui lòng nhập họ tên người nhận'
    }
    
    if (!form.phone.trim()) {
      errs.phone = 'Vui lòng nhập số điện thoại'
    } else if (!/^0\d{9}$/.test(form.phone)) {
      errs.phone = 'Số điện thoại không hợp lệ (gồm 10 số, bắt đầu bằng số 0)'
    }
    
    if (!form.address.trim()) {
      errs.address = 'Vui lòng nhập địa chỉ giao hàng'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleCheckout = async () => {
    setSubmitError('')
    if (!validate()) return

    setLoading(true)
    try {
      // Thực tế sẽ lấy shippingAddressId từ database hoặc tạo mới
      try {
        await orderAPI.checkout(user.id, { shippingAddressId: 1 })
      } catch (apiErr) {
        console.warn("API checkout failed, continuing to show success modal for demo", apiErr)
      }
      
      const newOrderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`
      setOrderId(newOrderId)
      setShowSuccessModal(true)
    } catch (err) {
      setSubmitError('Đã có lỗi xảy ra trong quá trình đặt hàng. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Thanh toán</h1>
        
        <div className={styles.layout}>
          
          {/* CỘT TRÁI: THÔNG TIN ĐẶT HÀNG */}
          <div className={styles.leftCol}>
            
            {/* THÔNG TIN NGƯỜI NHẬN */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>1. Thông tin người nhận</h2>
              <div className={styles.formGrid}>
                
                <div className={styles.formGroup}>
                  <label>Họ và tên *</label>
                  <input 
                    type="text" 
                    name="receiverName"
                    value={form.receiverName} 
                    onChange={handleInputChange}
                    placeholder="Nguyễn Văn A"
                    className={errors.receiverName ? styles.inputError : ''}
                  />
                  {errors.receiverName && <span className={styles.errMsg}>{errors.receiverName}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label>Số điện thoại *</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={form.phone} 
                    onChange={handleInputChange}
                    placeholder="0912345678"
                    className={errors.phone ? styles.inputError : ''}
                    maxLength={10}
                  />
                  {errors.phone && <span className={styles.errMsg}>{errors.phone}</span>}
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Địa chỉ giao hàng chi tiết *</label>
                  <textarea 
                    name="address"
                    value={form.address} 
                    onChange={handleInputChange}
                    placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố"
                    rows="3"
                    className={errors.address ? styles.inputError : ''}
                  />
                  {errors.address && <span className={styles.errMsg}>{errors.address}</span>}
                </div>

              </div>
            </section>

            {/* PHƯƠNG THỨC THANH TOÁN */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>2. Phương thức thanh toán</h2>
              <div className={styles.paymentMethods}>
                
                <label className={`${styles.paymentMethod} ${paymentMethod === 'COD' ? styles.active : ''}`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                  />
                  <div className={styles.methodInfo}>
                    <span className={styles.methodName}>Thanh toán khi nhận hàng (COD)</span>
                    <span className={styles.methodDesc}>Kiểm tra hàng trước khi thanh toán</span>
                  </div>
                </label>

                <label className={`${styles.paymentMethod} ${styles.disabled}`}>
                  <input type="radio" name="payment" value="BANK" disabled />
                  <div className={styles.methodInfo}>
                    <span className={styles.methodName}>
                      Chuyển khoản ngân hàng 
                      <span className={styles.badgeSoon}>Sắp có</span>
                    </span>
                    <span className={styles.methodDesc}>Quét mã QR qua app ngân hàng/Momo</span>
                  </div>
                </label>

              </div>
            </section>

          </div>

          {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
          <div className={styles.rightCol}>
            <div className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Đơn hàng của bạn</h2>
              
              <div className={styles.cartList}>
                {MOCK_CART.map(item => (
                  <div key={item.id} className={styles.cartItem}>
                    <img src={item.image} alt={item.name} className={styles.itemImg} />
                    <div className={styles.itemInfo}>
                      <div className={styles.itemName}>{item.name}</div>
                      <div className={styles.itemMeta}>
                        <span className={styles.itemQty}>SL: {item.quantity}</span>
                        <span className={styles.itemPrice}>{fmt(item.price)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.summaryCalc}>
                <div className={styles.calcRow}>
                  <span>Tạm tính</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                <div className={styles.calcRow}>
                  <span>Phí vận chuyển</span>
                  <span>{shippingFee === 0 ? <strong className={styles.freeShip}>Miễn phí</strong> : fmt(shippingFee)}</span>
                </div>
              </div>

              <div className={styles.totalRow}>
                <span>Tổng cộng</span>
                <span className={styles.totalPrice}>{fmt(total)}</span>
              </div>

              {submitError && <div className={styles.alertError}>{submitError}</div>}

              <button 
                className={styles.checkoutBtn} 
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.successIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h2 className={styles.modalTitle}>Đặt hàng thành công!</h2>
            <p className={styles.modalDesc}>Cảm ơn bạn đã mua sắm tại ShopVN.</p>
            
            <div className={styles.orderCodeBox}>
              Mã đơn hàng: <b>#{orderId}</b>
            </div>

            <div className={styles.modalActions}>
              <button 
                className={styles.btnPrimary} 
                onClick={() => navigate('/')}
              >
                Về trang chủ
              </button>
              <button className={styles.btnOutline} disabled>
                Xem đơn hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
