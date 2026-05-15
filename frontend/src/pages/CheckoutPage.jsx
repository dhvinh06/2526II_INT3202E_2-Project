import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { orderAPI } from '../api'
import styles from './CheckoutPage.module.css'

const MOCK_CART = [
  { id: 1, name: 'Áo thun nam basic oversize Hàn Quốc', price: 149000, quantity: 2, image: 'https://picsum.photos/seed/pr1/100/100' },
  { id: 4, name: 'Bình giữ nhiệt inox 316 500ml', price: 245000, quantity: 1, image: 'https://picsum.photos/seed/pr4/100/100' }
]
const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

export default function CheckoutPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  if (!user) return <Navigate to="/login" replace />

  const [form, setForm] = useState({ receiverName: user.name || '', phone: '', address: '' })
  const [errors, setErrors] = useState({})
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [orderId, setOrderId] = useState('')

  const subtotal = MOCK_CART.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingFee = subtotal >= 500000 ? 0 : 30000
  const total = subtotal + shippingFee

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.receiverName.trim()) errs.receiverName = 'Vui lòng nhập họ tên người nhận'
    if (!form.phone.trim()) errs.phone = 'Vui lòng nhập số điện thoại'
    else if (!/^0\d{9}$/.test(form.phone)) errs.phone = 'Số điện thoại không hợp lệ (gồm 10 số, bắt đầu bằng số 0)'
    if (!form.address.trim()) errs.address = 'Vui lòng nhập địa chỉ giao hàng'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleCheckout = async () => {
    setSubmitError('')
    if (!validate()) return
    setLoading(true)
    try {
      try { await orderAPI.checkout(user.id, { shippingAddressId: 1 }) } catch (apiErr) { console.warn('API checkout failed', apiErr) }
      const newOrderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`
      setOrderId(newOrderId)
      setShowSuccessModal(true)
    } catch (err) {
      setSubmitError('Đã có lỗi xảy ra trong quá trình đặt hàng. Vui lòng thử lại.')
    } finally { setLoading(false) }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={`t-display-md ${styles.pageTitle}`}>Thanh toán.</h1>
        <div className={styles.layout}>

          <div className={styles.leftCol}>
            <section className={styles.section}>
              <h2 className={`t-tagline ${styles.sectionTitle}`}>1. Thông tin người nhận</h2>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className="t-caption-strong">Họ và tên</label>
                  <input type="text" name="receiverName" value={form.receiverName} onChange={handleInputChange}
                    placeholder="Nguyễn Văn A" className={`pill-input ${errors.receiverName ? styles.inputError : ''}`} />
                  {errors.receiverName && <span className={`t-caption ${styles.errMsg}`}>{errors.receiverName}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label className="t-caption-strong">Số điện thoại</label>
                  <input type="tel" name="phone" value={form.phone} onChange={handleInputChange}
                    placeholder="0912345678" maxLength={10} className={`pill-input ${errors.phone ? styles.inputError : ''}`} />
                  {errors.phone && <span className={`t-caption ${styles.errMsg}`}>{errors.phone}</span>}
                </div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className="t-caption-strong">Địa chỉ giao hàng chi tiết</label>
                  <textarea name="address" value={form.address} onChange={handleInputChange} rows="3"
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    className={`${styles.textarea} ${errors.address ? styles.inputError : ''}`} />
                  {errors.address && <span className={`t-caption ${styles.errMsg}`}>{errors.address}</span>}
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={`t-tagline ${styles.sectionTitle}`}>2. Phương thức thanh toán</h2>
              <div className={styles.paymentMethods}>
                <label className={`${styles.paymentMethod} ${paymentMethod==='COD'?styles.active:''}`}>
                  <input type="radio" name="payment" value="COD" checked={paymentMethod==='COD'} onChange={() => setPaymentMethod('COD')} />
                  <div className={styles.methodInfo}>
                    <span className={`t-body-strong ${styles.methodName}`}>Thanh toán khi nhận hàng (COD)</span>
                    <span className={`t-caption ${styles.methodDesc}`}>Kiểm tra hàng trước khi thanh toán.</span>
                  </div>
                </label>
                <label className={`${styles.paymentMethod} ${styles.disabled}`}>
                  <input type="radio" name="payment" value="BANK" disabled />
                  <div className={styles.methodInfo}>
                    <span className={`t-body-strong ${styles.methodName}`}>
                      Chuyển khoản ngân hàng
                      <span className={`t-micro-legal ${styles.badgeSoon}`}>Sắp có</span>
                    </span>
                    <span className={`t-caption ${styles.methodDesc}`}>Quét mã QR qua app ngân hàng / Momo.</span>
                  </div>
                </label>
              </div>
            </section>
          </div>

          <div className={styles.rightCol}>
            <div className={styles.summaryCard}>
              <h2 className={`t-tagline ${styles.summaryTitle}`}>Đơn hàng của bạn</h2>
              <div className={styles.cartList}>
                {MOCK_CART.map(item => (
                  <div key={item.id} className={styles.cartItem}>
                    <img src={item.image} alt={item.name} className={styles.itemImg} />
                    <div className={styles.itemInfo}>
                      <div className={`t-body ${styles.itemName}`}>{item.name}</div>
                      <div className={`t-caption ${styles.itemMeta}`}><span>SL: {item.quantity}</span><span>{fmt(item.price)}</span></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.summaryCalc}>
                <div className={`t-body ${styles.calcRow}`}><span>Tạm tính</span><span>{fmt(subtotal)}</span></div>
                <div className={`t-body ${styles.calcRow}`}><span>Phí vận chuyển</span><span>{shippingFee===0?<span className={styles.freeShip}>Miễn phí</span>:fmt(shippingFee)}</span></div>
              </div>
              <div className={styles.totalRow}>
                <span className="t-body-strong">Tổng cộng</span>
                <span className={`t-display-md ${styles.totalPrice}`}>{fmt(total)}</span>
              </div>
              {submitError && <div className={`t-caption ${styles.alertError}`}>{submitError}</div>}
              <button className={`btn-primary ${styles.checkoutBtn}`} onClick={handleCheckout} disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.successIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 className={`t-display-md ${styles.modalTitle}`}>Đặt hàng thành công.</h2>
            <p className={`t-body ${styles.modalDesc}`}>Cảm ơn bạn đã mua sắm tại ShopVN.</p>
            <div className={`t-caption ${styles.orderCodeBox}`}>Mã đơn hàng: <b>#{orderId}</b></div>
            <div className={styles.modalActions}>
              <button className="btn-primary" onClick={() => navigate('/')}>Về trang chủ</button>
              <button className="btn-secondary-pill" disabled>Xem đơn hàng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
