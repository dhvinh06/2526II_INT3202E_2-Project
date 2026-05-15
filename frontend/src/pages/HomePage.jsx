import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import ProductCard from '../components/ProductCard'
import { productAPI, categoryAPI } from '../api/index'
import styles from './HomePage.module.css'

const MOCK_PRODUCTS = [
  { id: 1, name: 'Áo thun nam basic oversize Hàn Quốc', category: 'Thời trang', price: 149000, originalPrice: 220000, sold: 2104, image: 'https://picsum.photos/seed/pr1/400/400' },
  { id: 2, name: 'Tai nghe Bluetooth ANC chống ồn', category: 'Điện tử', price: 890000, originalPrice: 1290000, sold: 687, image: 'https://picsum.photos/seed/pr2/400/400' },
  { id: 3, name: 'Váy hoa maxi dáng dài nữ tính', category: 'Thời trang', price: 289000, originalPrice: 420000, sold: 856, image: 'https://picsum.photos/seed/pr3/400/400' },
  { id: 4, name: 'Bình giữ nhiệt inox 316 500ml', category: 'Gia dụng', price: 245000, originalPrice: 320000, sold: 3102, image: 'https://picsum.photos/seed/pr4/400/400' },
  { id: 5, name: 'Giày sneaker nam nữ đế êm thoáng khí', category: 'Thời trang', price: 520000, originalPrice: 650000, sold: 1432, image: 'https://picsum.photos/seed/pr5/400/400' },
  { id: 6, name: 'Đồng hồ thông minh đo sức khoẻ', category: 'Điện tử', price: 1250000, originalPrice: 1890000, sold: 312, image: 'https://picsum.photos/seed/pr6/400/400' },
  { id: 7, name: 'Loa Bluetooth mini chống nước IPX7', category: 'Điện tử', price: 450000, originalPrice: 680000, sold: 920, image: 'https://picsum.photos/seed/pr7/400/400' },
  { id: 8, name: 'Nồi chiên không dầu 5L digital', category: 'Gia dụng', price: 1490000, originalPrice: 2200000, sold: 445, image: 'https://picsum.photos/seed/pr8/400/400' },
  { id: 9, name: 'Bộ dưỡng da 5 bước cho da dầu', category: 'Làm đẹp', price: 450000, originalPrice: 650000, sold: 780, image: 'https://picsum.photos/seed/pr9/400/400' },
  { id: 10, name: 'Son môi matte lì 24h siêu bền màu', category: 'Làm đẹp', price: 120000, originalPrice: 185000, sold: 5200, image: 'https://picsum.photos/seed/pr10/400/400' },
  { id: 11, name: 'Sách Đắc Nhân Tâm bản mới 2024', category: 'Sách', price: 78000, originalPrice: 95000, sold: 8900, image: 'https://picsum.photos/seed/pr11/400/400' },
  { id: 12, name: 'Balo laptop chống nước 15.6"', category: 'Phụ kiện', price: 380000, originalPrice: 450000, sold: 1023, image: 'https://picsum.photos/seed/pr12/400/400' }
]

export default function HomePage() {
  const [parentCategories, setParentCategories] = useState([])
  const [childrenMap, setChildrenMap] = useState({})
  const [selectedParentId, setSelectedParentId] = useState(null)
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productAPI.getProducts()
        setProducts(data?.length > 0 ? data : MOCK_PRODUCTS)
      } catch (err) {
        setError(err.message)
        setProducts(MOCK_PRODUCTS)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryAPI.getAll()
        const parents  = data.filter(c => c.parentId === null)
        const children = data.filter(c => c.parentId !== null)
        const map = {}
        children.forEach(c => {
          if (!map[c.parentId]) map[c.parentId] = []
          map[c.parentId].push(c)
        })
        setParentCategories(parents)
        setChildrenMap(map)
      } catch (err) {
        console.error('Lỗi fetch categories:', err)
      }
    }
    fetchCategories()
  }, [])

  const handleParentClick = (parentId) => {
    setSelectedParentId(prev => prev === parentId ? null : parentId)
  }

  const recommendedProducts = products.slice(0, 8)
  const bestSellers = [...products].sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0)).slice(0, 8)

  return (
    <div className={styles.page}>

      {/* 1. HERO — full-bleed light tile */}
      <section className={styles.tileLight}>
        <div className={styles.tileInner}>
          <h1 className={`t-hero-display ${styles.heroTitle}`}>
            Mua sắm thả ga.<br />
            <span className={styles.heroAccent}>Giá cả phải chăng.</span>
          </h1>
          <p className={`t-lead ${styles.heroLead}`}>
            Hàng ngàn sản phẩm chất lượng, giao hàng nhanh toàn quốc.
          </p>
          <div className={styles.ctaRow}>
            <button className="btn-primary" onClick={() => navigate('/products')}>Khám phá ngay</button>
            <button className="btn-secondary-pill" onClick={() => navigate('/products?sort=bestseller')}>Xem bán chạy</button>
          </div>
          <div className={styles.heroImageWrap}>
            <img
              className={`${styles.heroImage} product-shadow`}
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=720&q=80"
              alt="Hero – Giày sneaker"
            />
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES — parchment */}
      <section className={styles.tileParchment}>
        <div className={styles.containerWide}>
          <h2 className={`t-display-lg ${styles.sectionTitle}`}>Danh mục nổi bật.</h2>
          <div className={styles.categoryRow}>
            {parentCategories.map(cat => (
              <button
                key={cat.id}
                type="button"
                className={`${styles.categoryCard} ${selectedParentId === cat.id ? styles.categoryCardSelected : ''}`}
                onClick={() => handleParentClick(cat.id)}
              >
                <div className={styles.catIcon}>{cat.icon ?? cat.name?.charAt(0)}</div>
                <div className={`t-caption-strong ${styles.catName}`}>{cat.name}</div>
              </button>
            ))}
          </div>
          {selectedParentId && childrenMap[selectedParentId] && (
            <div className={styles.childList}>
              {childrenMap[selectedParentId].map(child => (
                <button key={child.id} type="button" className={`${styles.childChip} t-caption`}
                  onClick={() => navigate(`/products?categoryId=${child.id}`)}>
                  {child.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. RECOMMENDED — light */}
      <section className={styles.tileLight}>
        <div className={styles.containerWide}>
          <div className={styles.sectionHeader}>
            <h2 className="t-display-lg">Sản phẩm đề xuất.</h2>
            <Link to="/products" className="text-link">Xem tất cả ›</Link>
          </div>
          {isLoading && <p className="t-body">Đang tải sản phẩm...</p>}
          {!isLoading && error && <p className="t-body" style={{ color: 'var(--c-ink-muted-48)' }}>Lỗi: {error}</p>}
          {!isLoading && (
            <div className={styles.grid}>
              {recommendedProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* 4. MID — dark tile */}
      <section className={styles.tileDark}>
        <div className={styles.tileInner}>
          <h2 className={`t-display-lg ${styles.darkTitle}`}>Giảm đến 50% cho thành viên mới.</h2>
          <p className={`t-lead ${styles.darkLead}`}>Đăng ký tài khoản ngay hôm nay để nhận ưu đãi.</p>
          <div className={styles.ctaRow}>
            <button className="btn-primary" onClick={() => navigate('/login')}>Đăng ký ngay</button>
            <Link to="/products" className="text-link text-link-on-dark">Xem sản phẩm ›</Link>
          </div>
        </div>
      </section>

      {/* 5. BESTSELLERS — light */}
      <section className={styles.tileLight}>
        <div className={styles.containerWide}>
          <div className={styles.sectionHeader}>
            <h2 className="t-display-lg">Sản phẩm bán chạy.</h2>
            <Link to="/products?sort=bestseller" className="text-link">Xem tất cả ›</Link>
          </div>
          {!isLoading && (
            <div className={styles.grid}>
              {bestSellers.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

    </div>
  )
}
