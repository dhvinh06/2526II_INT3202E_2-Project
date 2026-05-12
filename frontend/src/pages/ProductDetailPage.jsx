import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { productAPI } from '../api'
import styles from './ProductDetailPage.module.css'

// MOCK DATA
const MOCK_PRODUCT = {
  id: 1,
  name: 'Áo thun nam basic oversize Hàn Quốc vải cotton 100% thoáng mát, thấm hút mồ hôi tốt',
  category: 'fashion',
  price: 149000,
  originalPrice: 220000,
  rating: 4.8,
  reviewCount: 328,
  sold: 2104,
  stock: 156,
  images: [
    'https://picsum.photos/seed/p1_1/600/600',
    'https://picsum.photos/seed/p1_2/600/600',
    'https://picsum.photos/seed/p1_3/600/600',
    'https://picsum.photos/seed/p1_4/600/600',
  ],
  description: 'sản phẩm chất lượng',
  specs: [
    { label: 'Thương hiệu', value: 'OEM' },
    { label: 'Xuất xứ', value: 'Việt Nam' },
    { label: 'Chất liệu', value: 'Cotton' },
    { label: 'Kiểu dáng', value: 'Oversize' },
  ],
  reviews: [
    { id: 1, name: 'Nguyễn Văn A', avatar: 'A', rating: 5, date: '12/05/2026', comment: 'Áo đẹp, vải mát, form chuẩn hình. Rất đáng tiền!' },
    { id: 2, name: 'Trần Thị B', avatar: 'B', rating: 4, date: '10/05/2026', comment: 'Giao hàng nhanh, đóng gói cẩn thận. Màu hơi nhạt hơn trên hình một chút xíu.' },
    { id: 3, name: 'Lê Hoàng C', avatar: 'C', rating: 5, date: '05/05/2026', comment: 'Chất lượng quá ổn so với mức giá. Sẽ ủng hộ shop thêm.' },
    { id: 4, name: 'Phạm D', avatar: 'D', rating: 5, date: '01/05/2026', comment: 'Mua lần 2 rồi, áo giặt máy thoải mái không bị nhão form.' },
    { id: 5, name: 'Hoàng E', avatar: 'E', rating: 4, date: '28/04/2026', comment: 'Khá ok.' },
  ]
}

const SIMILAR_PRODUCTS = [
  { id: 2, name: 'Quần short nam kaki túi hộp', category: 'fashion', price: 189000, originalPrice: 250000, rating: 4.6, sold: 1250, image: 'https://picsum.photos/seed/s1/400/400' },
  { id: 3, name: 'Áo polo nam trơn vải cá sấu', category: 'fashion', price: 159000, originalPrice: 199000, rating: 4.7, sold: 3400, image: 'https://picsum.photos/seed/s2/400/400' },
  { id: 4, name: 'Giày sneaker nam đế bằng viền màu', category: 'fashion', price: 320000, originalPrice: 450000, rating: 4.5, sold: 890, image: 'https://picsum.photos/seed/s3/400/400' },
  { id: 5, name: 'Mũ lưỡi trai trơn phong cách bụi', category: 'fashion', price: 450000, originalPrice: 65000, rating: 4.8, sold: 5600, image: 'https://picsum.photos/seed/s4/400/400' },
]

const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
const discount = (sale, orig) => orig > sale ? Math.round((1 - sale / orig) * 100) : 0
const stars = (r) => {
  const v = Math.round(Number(r) || 0)
  return '★'.repeat(Math.max(0, Math.min(5, v))) + '☆'.repeat(Math.max(0, 5 - Math.max(0, Math.min(5, v))))
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')

  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0)
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const data = await productAPI.getProductById(id)
        if (data && data.id) {
          // Merge with mock to ensure UI doesn't break if API lacks images/reviews or returns them as null
          setProduct({ 
            ...MOCK_PRODUCT, 
            ...data, 
            id: Number(id),
            images: Array.isArray(data.images) ? data.images : MOCK_PRODUCT.images,
            specs: Array.isArray(data.specs) ? data.specs : MOCK_PRODUCT.specs,
            reviews: Array.isArray(data.reviews) ? data.reviews : MOCK_PRODUCT.reviews,
            description: 'sản phẩm chất lượng'
          })
        } else {
          setProduct({ ...MOCK_PRODUCT, id: Number(id) })
        }
        setSelectedImage(0)
        setQuantity(1)
        setActiveTab('description')
      } catch (err) {
        console.warn("API Error, falling back to mock data", err)
        setProduct({ ...MOCK_PRODUCT, id: Number(id) })
        setSelectedImage(0)
        setQuantity(1)
        setActiveTab('description')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
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

  const handleAddToCart = () => {
    alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`)
  }

  const handleBuyNow = () => {
    navigate('/checkout')
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
              <div className={styles.starsGroup}>
                <span className={styles.starsText} title={`${product.rating}/5`}>{stars(product.rating)}</span>
                <span className={styles.ratingNumber}>{product.rating}</span>
              </div>
              <span className={styles.divider}>|</span>
              <span className={styles.reviewCount}>{product.reviewCount} đánh giá</span>
              <span className={styles.divider}>|</span>
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
              Đánh giá ({product.reviewCount})
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
                {product.reviews.map(r => (
                  <div key={r.id} className={styles.reviewItem}>
                    <div className={styles.reviewAvatar}>{r.avatar}</div>
                    <div className={styles.reviewBody}>
                      <div className={styles.reviewUser}>{r.name}</div>
                      <div className={styles.reviewStars}>{stars(r.rating)}</div>
                      <div className={styles.reviewDate}>{r.date}</div>
                      <div className={styles.reviewComment}>{r.comment}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* SẢN PHẨM TƯƠNG TỰ */}
        <section className={styles.similarSection}>
          <h2 className={styles.similarTitle}>Sản phẩm tương tự</h2>
          <div className={styles.similarGrid}>
            {SIMILAR_PRODUCTS.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
