import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { productAPI } from '../api'
import styles from './ProductDetailPage.module.css'

const MOCK_PRODUCT = {
  id: 1,
  name: 'Áo thun nam basic oversize Hàn Quốc vải cotton 100% thoáng mát, thấm hút mồ hôi tốt',
  category: 'fashion', price: 149000, originalPrice: 220000, rating: 4.8, reviewCount: 328, sold: 2104, stock: 156,
  images: ['https://picsum.photos/seed/p1_1/600/600','https://picsum.photos/seed/p1_2/600/600','https://picsum.photos/seed/p1_3/600/600','https://picsum.photos/seed/p1_4/600/600'],
  description: 'sản phẩm chất lượng',
  specs: [{ label: 'Thương hiệu', value: 'OEM' },{ label: 'Xuất xứ', value: 'Việt Nam' },{ label: 'Chất liệu', value: 'Cotton' },{ label: 'Kiểu dáng', value: 'Oversize' }],
  reviews: [
    { id:1, name:'Nguyễn Văn A', avatar:'A', rating:5, date:'12/05/2026', comment:'Áo đẹp, vải mát, form chuẩn hình. Rất đáng tiền!' },
    { id:2, name:'Trần Thị B', avatar:'B', rating:4, date:'10/05/2026', comment:'Giao hàng nhanh, đóng gói cẩn thận.' },
    { id:3, name:'Lê Hoàng C', avatar:'C', rating:5, date:'05/05/2026', comment:'Chất lượng quá ổn so với mức giá.' },
    { id:4, name:'Phạm D', avatar:'D', rating:5, date:'01/05/2026', comment:'Mua lần 2 rồi, áo giặt máy thoải mái.' },
    { id:5, name:'Hoàng E', avatar:'E', rating:4, date:'28/04/2026', comment:'Khá ok.' },
  ]
}

const SIMILAR_PRODUCTS = [
  { id:2, name:'Quần short nam kaki túi hộp', category:'fashion', price:189000, originalPrice:250000, rating:4.6, sold:1250, image:'https://picsum.photos/seed/s1/400/400' },
  { id:3, name:'Áo polo nam trơn vải cá sấu', category:'fashion', price:159000, originalPrice:199000, rating:4.7, sold:3400, image:'https://picsum.photos/seed/s2/400/400' },
  { id:4, name:'Giày sneaker nam đế bằng viền màu', category:'fashion', price:320000, originalPrice:450000, rating:4.5, sold:890, image:'https://picsum.photos/seed/s3/400/400' },
  { id:5, name:'Mũ lưỡi trai trơn phong cách bụi', category:'fashion', price:450000, originalPrice:65000, rating:4.8, sold:5600, image:'https://picsum.photos/seed/s4/400/400' },
]

const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
const discount = (sale, orig) => orig > sale ? Math.round((1 - sale / orig) * 100) : 0
const stars = (r) => { const v = Math.round(Number(r)||0); return '★'.repeat(Math.max(0,Math.min(5,v)))+'☆'.repeat(Math.max(0,5-Math.max(0,Math.min(5,v)))) }

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [showStickyBar, setShowStickyBar] = useState(false)
  const actionsRef = useRef(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const data = await productAPI.getProductById(id)
        if (data && data.id) {
          setProduct({ ...MOCK_PRODUCT, ...data, id: Number(id),
            images: Array.isArray(data.images) ? data.images : MOCK_PRODUCT.images,
            specs: Array.isArray(data.specs) ? data.specs : MOCK_PRODUCT.specs,
            reviews: Array.isArray(data.reviews) ? data.reviews : MOCK_PRODUCT.reviews,
            description: 'sản phẩm chất lượng' })
        } else {
          setProduct({ ...MOCK_PRODUCT, id: Number(id) })
        }
        setSelectedImage(0); setQuantity(1); setActiveTab('description')
      } catch (err) {
        setProduct({ ...MOCK_PRODUCT, id: Number(id) })
        setSelectedImage(0); setQuantity(1); setActiveTab('description')
      } finally { setLoading(false) }
    }
    fetchProduct()
  }, [id])

  useEffect(() => {
    if (!actionsRef.current) return
    const observer = new IntersectionObserver(([entry]) => setShowStickyBar(!entry.isIntersecting), { rootMargin: '0px 0px -100% 0px', threshold: 0 })
    observer.observe(actionsRef.current)
    return () => observer.disconnect()
  }, [product])

  const handleQtyChange = (delta) => {
    setQuantity(prev => { const next = prev + delta; if (next < 1) return 1; if (next > product.stock) return product.stock; return next })
  }
  const handleManualQty = (e) => {
    const val = parseInt(e.target.value)
    if (isNaN(val) || val < 1) setQuantity(1)
    else if (val > product.stock) setQuantity(product.stock)
    else setQuantity(val)
  }
  const handleAddToCart = () => alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`)
  const handleBuyNow = () => navigate('/checkout')

  if (loading) return <div className={`${styles.statePage} t-body`}>Đang tải thông tin sản phẩm...</div>
  if (error || !product) return (
    <div className={styles.statePage}>
      <h3 className="t-display-md">Sản phẩm không tồn tại.</h3>
      <button onClick={() => navigate('/products')} className="btn-primary">Quay lại danh sách</button>
    </div>
  )

  const disc = discount(product.price, product.originalPrice)

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <div className={`${styles.innerBreadcrumb} t-caption`}>
          <Link to="/">Trang chủ</Link><span>/</span><Link to="/products">Sản phẩm</Link><span>/</span>
          <span className={styles.currentCrumb}>Chi tiết</span>
        </div>
      </div>

      <div className={styles.container}>
        <section className={styles.topSection}>
          {/* GALLERY */}
          <div className={styles.gallery}>
            <div className={styles.mainImageWrap}>
              <img src={product.images[selectedImage]} alt={product.name} className={`${styles.mainImage} product-shadow`} />
            </div>
            <div className={styles.thumbnailList}>
              {product.images.map((img,idx) => (
                <button key={idx} type="button"
                  className={`${styles.thumbnailWrap} ${idx===selectedImage?styles.thumbActive:''}`}
                  onClick={() => setSelectedImage(idx)}>
                  <img src={img} alt={`Thumb ${idx}`} />
                </button>
              ))}
            </div>
          </div>

          {/* INFO */}
          <div className={styles.info}>
            <h1 className={`t-display-md ${styles.title}`}>{product.name}</h1>
            <div className={`${styles.ratingRow} t-caption`}>
              <span className={styles.starsText}>{stars(product.rating)}</span>
              <span>{product.rating}</span><span className={styles.divider}>·</span>
              <span>{product.reviewCount} đánh giá</span><span className={styles.divider}>·</span>
              <span>{product.sold} đã bán</span>
            </div>
            <div className={styles.priceBox}>
              <span className={`t-display-lg ${styles.salePrice}`}>{fmt(product.price)}</span>
              {product.originalPrice > product.price && (
                <span className={`t-caption ${styles.origPrice}`}>
                  {fmt(product.originalPrice)} <span className={styles.discountChip}>− {disc}%</span>
                </span>
              )}
            </div>

            <div className={styles.attributes}>
              <div className={styles.attrRow}>
                <span className={`t-caption-strong ${styles.attrLabel}`}>Vận chuyển</span>
                <div className={`t-caption ${styles.attrContent}`}>
                  <p>Giao hàng hỏa tốc trong 2 giờ.</p>
                  <p>Miễn phí vận chuyển toàn quốc cho đơn từ 150.000₫.</p>
                </div>
              </div>
              <div className={styles.attrRow}>
                <span className={`t-caption-strong ${styles.attrLabel}`}>Số lượng</span>
                <div className={styles.attrContent}>
                  <div className={styles.qtyBox}>
                    <button type="button" className={styles.qtyBtn} onClick={() => handleQtyChange(-1)} disabled={quantity<=1}>−</button>
                    <input type="number" value={quantity} onChange={handleManualQty} />
                    <button type="button" className={styles.qtyBtn} onClick={() => handleQtyChange(1)} disabled={quantity>=product.stock}>+</button>
                  </div>
                  <span className={`t-caption ${styles.stockInfo}`}>Còn {product.stock} sản phẩm</span>
                </div>
              </div>
            </div>

            <div className={styles.actionsBox} ref={actionsRef}>
              <button className="btn-secondary-pill" onClick={handleAddToCart}>Thêm vào giỏ</button>
              <button className="btn-primary" onClick={handleBuyNow}>Mua ngay</button>
            </div>

            <div className={`t-caption ${styles.policies}`}>
              <span>Đổi trả miễn phí 7 ngày.</span>
              <span>Hàng chính hãng 100%.</span>
            </div>
          </div>
        </section>

        {/* TABS */}
        <section className={styles.tabsSection}>
          <div className={styles.tabHeader}>
            {[['description','Mô tả sản phẩm'],['specs','Thông số kỹ thuật'],['reviews',`Đánh giá (${product.reviewCount})`]].map(([key,label]) => (
              <button key={key} className={`${styles.tabBtn} ${activeTab===key?styles.activeTab:''} t-tagline`} onClick={() => setActiveTab(key)}>{label}</button>
            ))}
          </div>
          <div className={styles.tabContent}>
            {activeTab === 'description' && <div className={`t-body ${styles.descriptionTab}`}>{product.description || 'sản phẩm chất lượng'}</div>}
            {activeTab === 'specs' && (
              <div className={styles.specsTab}>
                {product.specs.map((s,i) => (
                  <div key={i} className={styles.specRow}>
                    <div className={`t-caption-strong ${styles.specLabel}`}>{s.label}</div>
                    <div className={`t-body ${styles.specValue}`}>{s.value}</div>
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
                      <div className={styles.reviewHead}>
                        <span className="t-body-strong">{r.name}</span>
                        <span className={`t-caption ${styles.reviewDate}`}>{r.date}</span>
                      </div>
                      <div className={`t-caption ${styles.reviewStars}`}>{stars(r.rating)}</div>
                      <div className="t-body">{r.comment}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* SIMILAR */}
        <section className={styles.similarSection}>
          <h2 className={`t-display-md ${styles.similarTitle}`}>Sản phẩm tương tự</h2>
          <div className={styles.similarGrid}>
            {SIMILAR_PRODUCTS.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      </div>

      {/* FLOATING STICKY BAR */}
      {showStickyBar && (
        <div className={styles.stickyBar}>
          <div className={styles.stickyInner}>
            <div className={styles.stickyLeft}>
              <div className={`t-caption ${styles.stickyName}`}>{product.name}</div>
              <div className={`t-body-strong ${styles.stickyPrice}`}>{fmt(product.price * quantity)}</div>
            </div>
            <div className={styles.stickyRight}>
              <button className="btn-secondary-pill" onClick={handleAddToCart}>Thêm vào giỏ</button>
              <button className="btn-primary" onClick={handleBuyNow}>Mua ngay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
