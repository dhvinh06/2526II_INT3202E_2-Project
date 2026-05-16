import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { cartAPI, orderAPI } from '../api'
import styles from './CartPage.module.css'

const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

export default function CartPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [checkingCoupon, setCheckingCoupon] = useState(false)
  const [couponError, setCouponError] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    
    fetchCart()
  }, [user, navigate])

  const fetchCart = async () => {
    setLoading(true)
    try {
      const data = await cartAPI.getCart(user.id)
      setCartItems(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Lỗi tải giỏ hàng.')
    } finally {
      setLoading(false)
    }
  }

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return
    setCheckingCoupon(true)
    setCouponError('')
    try {
      const res = await orderAPI.checkCoupon(user.id, couponInput.trim())
      if (res.valid) {
        setAppliedCoupon({
          code: couponInput.trim(),
          discountPercent: res.discountPercent,
          discountAmount: res.discountAmount,
          discountedTotal: res.discountedTotal
        })
      }
    } catch (err) {
      setCouponError(err.message || 'Mã giảm giá không hợp lệ')
      setAppliedCoupon(null)
    } finally {
      setCheckingCoupon(false)
    }
  }

  const handleUpdateQty = async (id, currentQty, delta) => {
    const nextQty = currentQty + delta
    if (nextQty < 1) return

    try {
      await cartAPI.updateQuantity(id, { quantity: nextQty })
      setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: nextQty } : item))
      setAppliedCoupon(null) // Reset coupon when quantity changes as total changes
    } catch (err) {
      alert('Không thể cập nhật số lượng.')
    }
  }

  const handleRemoveItem = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) return
    
    try {
      await cartAPI.deleteCartItem(id)
      setCartItems(prev => prev.filter(item => item.id !== id))
      setAppliedCoupon(null)
    } catch (err) {
      alert('Lỗi xóa sản phẩm.')
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const finalTotal = appliedCoupon ? appliedCoupon.discountedTotal : subtotal

  if (!user) return null

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Giỏ hàng của bạn</h1>

        {loading ? (
          <p>Đang tải giỏ hàng...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : cartItems.length === 0 ? (
          <div className={styles.emptyCart}>
            <p>Giỏ hàng của bạn đang trống.</p>
            <button onClick={() => navigate('/products')} className={styles.btnPrimary}>Tiếp tục mua sắm</button>
          </div>
        ) : (
          <div className={styles.layout}>
            <div className={styles.cartList}>
              <div className={styles.listHeader}>
                <span className={styles.colProduct}>Sản phẩm</span>
                <span className={styles.colPrice}>Đơn giá</span>
                <span className={styles.colQty}>Số lượng</span>
                <span className={styles.colTotal}>Thành tiền</span>
                <span className={styles.colAction}></span>
              </div>
              
              {cartItems.map(item => (
                <div key={item.id} className={styles.cartItem}>
                  <div className={styles.colProduct}>
                    <img src={item.image || 'https://via.placeholder.com/80'} alt={item.name} className={styles.itemImg} />
                    <Link to={`/products/${item.productId}`} className={styles.itemName}>
                      {item.name}
                    </Link>
                  </div>
                  <div className={styles.colPrice}>{fmt(item.price)}</div>
                  <div className={styles.colQty}>
                    <div className={styles.qtyBox}>
                      <button onClick={() => handleUpdateQty(item.id, item.quantity, -1)} disabled={item.quantity <= 1}>-</button>
                      <input type="number" value={item.quantity} readOnly />
                      <button onClick={() => handleUpdateQty(item.id, item.quantity, 1)}>+</button>
                    </div>
                  </div>
                  <div className={styles.colTotal}>{fmt(item.price * item.quantity)}</div>
                  <div className={styles.colAction}>
                    <button onClick={() => handleRemoveItem(item.id)} className={styles.removeBtn}>🗑️ Xóa</button>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Tóm tắt đơn hàng</h2>
              <div className={styles.calcRow}>
                <span>Tạm tính:</span>
                <span>{fmt(subtotal)}</span>
              </div>
              
              <div className={styles.couponSection}>
                <div className={styles.couponInputWrapper}>
                  <input 
                    type="text" 
                    placeholder="Mã giảm giá (VD: GIAM10)" 
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className={styles.couponInput}
                  />
                  <button 
                    onClick={handleApplyCoupon} 
                    disabled={checkingCoupon || !couponInput.trim()}
                    className={styles.applyBtn}
                  >
                    {checkingCoupon ? '...' : 'Áp dụng'}
                  </button>
                </div>
                {couponError && <p className={styles.couponError}>{couponError}</p>}
                {appliedCoupon && <p className={styles.couponSuccess}>Đã áp dụng mã {appliedCoupon.code}</p>}
              </div>

              {appliedCoupon && (
                <div className={`${styles.calcRow} ${styles.discountRow}`}>
                  <span>Giảm giá ({appliedCoupon.discountPercent}%):</span>
                  <span>-{fmt(appliedCoupon.discountAmount)}</span>
                </div>
              )}

              <p className={styles.shippingNote}>Phí vận chuyển sẽ được tính ở bước thanh toán.</p>
              <div className={styles.totalRow}>
                <span>Tổng cộng:</span>
                <span className={styles.totalPrice}>{fmt(finalTotal)}</span>
              </div>
              <button className={styles.checkoutBtn} onClick={() => navigate('/checkout', { state: { couponCode: appliedCoupon?.code } })}>
                Tiến hành thanh toán
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
