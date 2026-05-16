import {useState, useEffect, useRef} from 'react'
import {useParams, useNavigate, Link} from 'react-router-dom'
import {productAPI, reviewAPI} from '../api'
import styles from './ProductDetailPage.module.css'

const fmt = (n) => new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(n)
const discount = (sale, orig) => orig > sale ? Math.round((1 - sale / orig) * 100) : 0
const stars = (r) => {
    const v = Math.round(Number(r) || 0);
    return '★'.repeat(Math.max(0, Math.min(5, v))) + '☆'.repeat(Math.max(0, 5 - Math.max(0, Math.min(5, v))))
}

export default function ProductDetailPage() {
    const {id} = useParams()
    const navigate = useNavigate()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedImage, setSelectedImage] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [activeTab, setActiveTab] = useState('description')
    const [showStickyBar, setShowStickyBar] = useState(false)
    const actionsRef = useRef(null)
    const [reviews, setReviews] = useState([])

    useEffect(() => {
        if (!id) return
        reviewAPI.getByProduct(id)
            .then(data => setReviews(data ?? []))
            .catch(() => {
            })
    }, [id])

    useEffect(() => {
        window.scrollTo(0, 0)
        const fetchProduct = async () => {
            setLoading(true)
            try {
                const data = await productAPI.getProductById(id)
                if (data?.id) {
                    // FIX 1: wrap image string thành array
                    setProduct({...data, images: data.image ? [data.image] : []})
                } else {
                    setError('Không tìm thấy sản phẩm')
                }
                setSelectedImage(0);
                setQuantity(1);
                setActiveTab('description')
            } catch (err) {
                setError('Không thể tải sản phẩm')
            } finally {
                setLoading(false)
            }
        }
        fetchProduct()
    }, [id])

    useEffect(() => {
        if (!actionsRef.current) return
        const observer = new IntersectionObserver(([entry]) => setShowStickyBar(!entry.isIntersecting), {
            rootMargin: '0px 0px -100% 0px',
            threshold: 0
        })
        observer.observe(actionsRef.current)
        return () => observer.disconnect()
    }, [product])

    const handleQtyChange = (delta) => {
        setQuantity(prev => {
            const next = prev + delta;
            if (next < 1) return 1;
            if (next > product.stock) return product.stock;
            return next
        })
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
                    <div className={styles.gallery}>
                        <div className={styles.mainImageWrap}>
                            <img src={product.images[selectedImage]} alt={product.name}
                                 className={`${styles.mainImage} product-shadow`}/>
                        </div>
                        <div className={styles.thumbnailList}>
                            {product.images.map((img, idx) => (
                                <button key={idx} type="button"
                                        className={`${styles.thumbnailWrap} ${idx === selectedImage ? styles.thumbActive : ''}`}
                                        onClick={() => setSelectedImage(idx)}>
                                    <img src={img} alt={`Thumb ${idx}`}/>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.info}>
                        <h1 className={`t-display-md ${styles.title}`}>{product.name}</h1>
                        <div className={`${styles.ratingRow} t-caption`}>
                            <span className={styles.starsText}>{stars(product.rating)}</span>
                            <span>{product.rating}</span><span className={styles.divider}>·</span>
                            {/* FIX 2: dùng reviews.length thay product.reviewCount */}
                            <span>{reviews.length} đánh giá</span><span className={styles.divider}>·</span>
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
                                        <button type="button" className={styles.qtyBtn}
                                                onClick={() => handleQtyChange(-1)} disabled={quantity <= 1}>−
                                        </button>
                                        <input type="number" value={quantity} onChange={handleManualQty}/>
                                        <button type="button" className={styles.qtyBtn}
                                                onClick={() => handleQtyChange(1)}
                                                disabled={quantity >= product.stock}>+
                                        </button>
                                    </div>
                                    <span
                                        className={`t-caption ${styles.stockInfo}`}>Còn {product.stock} sản phẩm</span>
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

                <section className={styles.tabsSection}>
                    <div className={styles.tabHeader}>
                        {/* FIX 2: reviews.length thay product.reviewCount */}
                        {[['description', 'Mô tả sản phẩm'], ['specs', 'Thông số kỹ thuật'], ['reviews', `Đánh giá (${reviews.length})`]].map(([key, label]) => (
                            <button key={key}
                                    className={`${styles.tabBtn} ${activeTab === key ? styles.activeTab : ''} t-tagline`}
                                    onClick={() => setActiveTab(key)}>{label}</button>
                        ))}
                    </div>
                    <div className={styles.tabContent}>
                        {activeTab === 'description' && (
                            <div className={`t-body ${styles.descriptionTab}`}>
                                {product.description || 'Chưa có mô tả sản phẩm.'}
                            </div>
                        )}
                        {activeTab === 'specs' && (
                            <div className={styles.specsTab}>
                                {(product.specs ?? []).length === 0
                                    ? <p className="t-body">Chưa có thông số kỹ thuật.</p>
                                    : (product.specs ?? []).map((s, i) => (
                                        <div key={i} className={styles.specRow}>
                                            <div className={`t-caption-strong ${styles.specLabel}`}>{s.label}</div>
                                            <div className={`t-body ${styles.specValue}`}>{s.value}</div>
                                        </div>
                                    ))
                                }
                            </div>
                        )}
                        {activeTab === 'reviews' && (
                            <div className={styles.reviewsTab}>
                                {/* FIX 3: dùng reviews state thay product.reviews */}
                                {reviews.length === 0
                                    ? <p className="t-body">Chưa có đánh giá nào.</p>
                                    : reviews.map(r => (
                                        <div key={r.id} className={styles.reviewItem}>
                                            <div className={styles.reviewAvatar}>
                                                {r.userName?.charAt(0) ?? '?'}
                                            </div>
                                            <div className={styles.reviewBody}>
                                                <div className={styles.reviewHead}>
                                                    <span className="t-body-strong">{r.userName}</span>
                                                    <span className={`t-caption ${styles.reviewDate}`}>
                                                      {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                                <div
                                                    className={`t-caption ${styles.reviewStars}`}>{stars(r.rating)}</div>
                                                <div className="t-body">{r.comment}</div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        )}
                    </div>
                </section>
            </div>

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