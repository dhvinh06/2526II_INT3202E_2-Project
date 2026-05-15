import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { productAPI, reviewAPI, cartAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import styles from './ProductDetailPage.module.css'

// Đã xóa MOCK_PRODUCT và SIMILAR_PRODUCTS

const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
const discount = (sale, orig) => orig > sale ? Math.round((1 - sale / orig) * 100) : 0
const stars = (r) => {
  const v = Math.round(Number(r) || 0)
  return '★'.repeat(Math.max(0, Math.min(5, v))) + '☆'.repeat(Math.max(0, 5 - Math.max(0, Math.min(5, v))))
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')

  // State cho reviews thực từ API
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)

  // State cho form gửi đánh giá
  const [submitRating, setSubmitRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [submitComment, setSubmitComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const data = await productAPI.getProductById(id)
        if (data && data.id) {
          setProduct({
            ...data,
            id: Number(id),
            images: data.images ? (Array.isArray(data.images) ? data.images : [data.images]) : ['https://via.placeholder.com/600?text=No+Image'],
            specs: data.specs || [],
          })
        } else {
          setError('Không tìm thấy sản phẩm')
          setProduct(null)
        }
        setSelectedImage(0)
        setQuantity(1)
        setActiveTab('description')
      } catch (err) {
        console.warn('API Error:', err)
        setError('Lỗi kết nối máy chủ')
        setProduct(null)
        setSelectedImage(0)
        setQuantity(1)
        setActiveTab('description')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  // Fetch reviews thực từ API
  useEffect(() => {
    if (!id) return
    const fetchReviews = async () => {
      setReviewsLoading(true)
      try {
        const data = await reviewAPI.getByProduct(id)
        setReviews(Array.isArray(data) ? data : [])
      } catch (err) {
        console.warn('Không thể tải đánh giá:', err)
        setReviews([])
      } finally {
        setReviewsLoading(false)
      }
    }
    fetchReviews()
  }, [id])

  const handleQtyChange = (delta) => {
    setQuantity(prev => {
      const next = prev + delta
      if (next < 1) return 1
      if (next > product.stock) return product.stock
      return next
    })
  }

  const handleManualQty = (e) => {
    const val = parseInt(e.target.value)
    if (isNaN(val) || val < 1) setQuantity(1)
    else if (val > product.stock) setQuantity(product.stock)
    else setQuantity(val)
  }

  const handleAddToCart = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để thêm vào giỏ hàng.')
      navigate('/login')
      return
    }
    try {
      await cartAPI.addToCart({
        userId: user.id,
        productId: product.id,
        quantity: quantity
      })
      alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`)
    } catch (err) {
      alert(err.message || 'Lỗi khi thêm vào giỏ hàng.')
    }
  }

  const handleBuyNow = () => {
    navigate('/checkout')
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!user) {
      setSubmitError('Bạn cần đăng nhập để gửi đánh giá.')
      return
    }
    if (submitRating === 0) {
      setSubmitError('Vui lòng chọn số sao.')
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    try {
      await reviewAPI.create({
        productId: Number(id),
        userId: user.id,
        rating: submitRating,
        comment: submitComment.trim()
      })
      setSubmitSuccess(true)
      setSubmitRating(0)
      setSubmitComment('')
      // Tải lại danh sách reviews
      const data = await reviewAPI.getByProduct(id)
      setReviews(Array.isArray(data) ? data : [])
    } catch (err) {
      setSubmitError(err.message || 'Gửi đánh giá thất bại. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className={styles.loadingContainer}>Đang tải thông tin sản phẩm...</div>
  }

  if (error || !product) {
    return (
      <div className={styles.errorContainer}>
        <h3>Opps! {error || 'Sản phẩm không tồn tại.'}</h3>
        <button onClick={() => navigate('/products')} className={styles.btnPrimary}>Quay lại danh sách</button>
      </div>
    )
  }

  const disc = discount(product.price, product.originalPrice)

  return (
    <div className={styles.page}>
      
      {/* BREADCRUMB */}
      <div className={styles.breadcrumb}>
        <div className={styles.innerBreadcrumb}>
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <Link to="/products">Sản phẩm</Link>
          <span>/</span>
          <span className={styles.currentCrumb}>Chi tiết</span>
        </div>
      </div>

      <div className={styles.container}>
        
        {/* PHẦN TRÊN: ẢNH & THÔNG TIN */}
        <section className={styles.topSection}>
          
          {/* CỘT TRÁI: ẢNH */}
          <div className={styles.gallery}>
            <div className={styles.mainImageWrap}>
              <img src={product.images[selectedImage]} alt={product.name} className={styles.mainImage} />
            </div>
            <div className={styles.thumbnailList}>
              {product.images.map((img, idx) => (
                <div 
                  key={idx} 
                  className={`${styles.thumbnailWrap} ${idx === selectedImage ? styles.thumbActive : ''}`}
                  onMouseEnter={() => setSelectedImage(idx)}
                >
                  <img src={img} alt={`Thumb ${idx}`} />
                </div>
              ))}
            </div>
          </div>

          {/* CỘT PHẢI: THÔNG TIN */}
          <div className={styles.info}>
            <h1 className={styles.title}>{product.name}</h1>
            
            <div className={styles.ratingRow}>
              {reviews.length > 0 ? (
                <>
                  <div className={styles.starsGroup}>
                    <span className={styles.starsText}>{stars(product.rating)}</span>
                    <span className={styles.ratingNumber}>{Number(product.rating).toFixed(1)}</span>
                  </div>
                  <span className={styles.divider}>|</span>
                  <span className={styles.reviewCount}>{reviews.length} đánh giá</span>
                  <span className={styles.divider}>|</span>
                </>
              ) : (
                <>
                  <span className={styles.reviewCount} style={{ color: 'var(--gray-400)' }}>Chưa có đánh giá</span>
                  <span className={styles.divider}>|</span>
                </>
              )}
              <span className={styles.soldCount}>{product.sold} đã bán</span>
            </div>

            <div className={styles.priceBox}>
              <span className={styles.salePrice}>{fmt(product.price)}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className={styles.origPrice}>{fmt(product.originalPrice)}</span>
                  <span className={styles.badgeDiscount}>-{disc}%</span>
                </>
              )}
            </div>

            <div className={styles.attributes}>
              <div className={styles.attrRow}>
                <span className={styles.attrLabel}>Vận chuyển</span>
                <div className={styles.attrContent}>
                  <p className={styles.shippingText}>🚀 Giao hàng hỏa tốc trong 2h</p>
                  <p className={styles.shippingText}>📦 Miễn phí vận chuyển toàn quốc cho đơn từ 150k</p>
                </div>
              </div>

              <div className={styles.attrRow}>
                <span className={styles.attrLabel}>Số lượng</span>
                <div className={styles.attrContent}>
                  <div className={styles.qtyBox}>
                    <button onClick={() => handleQtyChange(-1)} disabled={quantity <= 1}>-</button>
                    <input type="number" value={quantity} onChange={handleManualQty} />
                    <button onClick={() => handleQtyChange(1)} disabled={quantity >= product.stock}>+</button>
                  </div>
                  <span className={styles.stockInfo}>Còn {product.stock} sản phẩm</span>
                </div>
              </div>
            </div>

            <div className={styles.actionsBox}>
              <button className={styles.btnOutline} onClick={handleAddToCart}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                Thêm vào giỏ
              </button>
              <button className={styles.btnPrimary} onClick={handleBuyNow}>
                Mua ngay
              </button>
            </div>

            <div className={styles.policies}>
              <div className={styles.policyItem}>
                <span>↩️</span> Đổi trả miễn phí 7 ngày
              </div>
              <div className={styles.policyItem}>
                <span>🛡️</span> Hàng chính hãng 100%
              </div>
            </div>
          </div>
        </section>

        {/* PHẦN DƯỚI: TABS THÔNG TIN */}
        <section className={styles.tabsSection}>
          <div className={styles.tabHeader}>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'description' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Mô tả sản phẩm
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'specs' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('specs')}
            >
              Thông số kỹ thuật
            </button>
          <button 
              className={`${styles.tabBtn} ${activeTab === 'reviews' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Đánh giá ({reviews.length})
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'description' && (
              <div className={styles.descriptionTab}>
                {product.description || 'sản phẩm chất lượng'}
              </div>
            )}

            {activeTab === 'specs' && (
              <div className={styles.specsTab}>
                {product.specs.map((s, i) => (
                  <div key={i} className={styles.specRow}>
                    <div className={styles.specLabel}>{s.label}</div>
                    <div className={styles.specValue}>{s.value}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className={styles.reviewsTab}>

                {/* DANH SÁCH REVIEWS */}
                {reviewsLoading ? (
                  <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: '20px 0' }}>Đang tải đánh giá...</p>
                ) : reviews.length === 0 ? (
                  <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: '20px 0' }}>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                ) : (
                  reviews.map(r => (
                    <div key={r.id} className={styles.reviewItem}>
                      <div className={styles.reviewAvatar}>{(r.userName || 'U')[0].toUpperCase()}</div>
                      <div className={styles.reviewBody}>
                        <div className={styles.reviewUser}>{r.userName || 'Người dùng ẩn danh'}</div>
                        <div className={styles.reviewStars}>{stars(r.rating)}</div>
                        <div className={styles.reviewDate}>
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : ''}
                        </div>
                        <div className={styles.reviewComment}>{r.comment}</div>
                      </div>
                    </div>
                  ))
                )}

                {/* FORM GỬI ĐÁNH GIÁ */}
                <div className={styles.reviewFormWrap}>
                  <h3 className={styles.reviewFormTitle}>Viết đánh giá của bạn</h3>
                  {!user ? (
                    <p className={styles.reviewLoginNote}>
                      Bạn cần <Link to="/login">đăng nhập</Link> để gửi đánh giá.
                    </p>
                  ) : submitSuccess ? (
                    <p className={styles.reviewSuccess}>✅ Cảm ơn bạn đã đánh giá!</p>
                  ) : (
                    <form onSubmit={handleSubmitReview} className={styles.reviewForm}>
                      {/* CHỌN SAO */}
                      <div className={styles.starPicker}>
                        {[1,2,3,4,5].map(star => (
                          <span
                            key={star}
                            className={styles.starPickerStar}
                            style={{ color: star <= (hoverRating || submitRating) ? '#faad14' : 'var(--gray-200)', cursor: 'pointer', fontSize: '28px' }}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setSubmitRating(star)}
                          >
                            ★
                          </span>
                        ))}
                        {submitRating > 0 && (
                          <span style={{ marginLeft: '8px', fontSize: '14px', color: 'var(--gray-400)' }}>
                            {['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Rất tốt'][submitRating]}
                          </span>
                        )}
                      </div>

                      {/* NHẬP COMMENT */}
                      <textarea
                        className={styles.reviewTextarea}
                        placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                        value={submitComment}
                        onChange={e => setSubmitComment(e.target.value)}
                        rows={4}
                      />

                      {submitError && <p className={styles.reviewError}>{submitError}</p>}

                      <button type="submit" className={styles.btnPrimary} disabled={submitting} style={{ alignSelf: 'flex-start', padding: '10px 28px' }}>
                        {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                      </button>
                    </form>
                  )}
                </div>

              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  )
}
