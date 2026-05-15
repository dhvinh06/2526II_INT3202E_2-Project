import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import ProductCard from '../components/ProductCard'
import { productAPI, categoryAPI } from '../api/index'
import styles from './HomePage.module.css'

// Đã xóa MOCK_PRODUCTS

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
        // Cập nhật sản phẩm với data từ API
        setProducts(data?.length > 0 ? data : [])
      } catch (err) {
        setError(err.message)
        setProducts([]) // không dùng mock nữa
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
        const parents = data.filter(c => c.parentId === null)
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

      {/* 1. HERO BANNER */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>🔥 Khuyến mãi siêu khủng</div>
          <h1 className={styles.heroTitle}>
            Mua sắm thả ga<br />
            <span>giá cả phải chăng</span>
          </h1>
          <p className={styles.heroDesc}>
            Hàng ngàn sản phẩm chất lượng, giao hàng nhanh toàn quốc, hoàn tiền 100% nếu không hài lòng.
          </p>
          <button className={styles.heroBtn} onClick={() => navigate('/products')}>
            Khám phá ngay
          </button>
        </div>
        <div className={styles.heroImage}>
          <img src="https://picsum.photos/seed/hero/600/400" alt="Hero Banner" />
        </div>
      </section>

      {/* 2. DANH MỤC NỔI BẬT */}
      <section className={styles.container}>
        <h2 className={styles.sectionTitle}>Danh mục nổi bật</h2>

        <div className={styles.categoryRow}>
          {parentCategories.map(cat => (
            <div
              key={cat.id}
              className={`${styles.categoryItem} ${selectedParentId === cat.id ? styles.categoryItemActive : ''}`}
              onClick={() => handleParentClick(cat.id)}
            >
              <div className={styles.catIcon}>{cat.icon ?? '🏷️'}</div>
              <div className={styles.catName}>{cat.name}</div>
            </div>
          ))}
        </div>

        {selectedParentId && childrenMap[selectedParentId] && (
          <div className={styles.childList}>
            {childrenMap[selectedParentId].map(child => (
              <div
                key={child.id}
                className={styles.childItem}
                onClick={() => navigate(`/products?categoryId=${child.id}`)}
              >
                {child.name}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. SẢN PHẨM ĐỀ XUẤT */}
      <section className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Sản phẩm đề xuất</h2>
          <Link to="/products" className={styles.seeAll}>Xem tất cả</Link>
        </div>

        {isLoading && <p>Đang tải sản phẩm...</p>}
        {!isLoading && error && <p style={{ color: 'red' }}>Lỗi: {error}</p>}
        {!isLoading && (
          <div className={styles.grid}>
            {recommendedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* 4. MID BANNER */}
      <section className={styles.midBanner}>
        <div className={styles.midBannerContent}>
          <h2>Giảm giá đến 50% cho thành viên mới</h2>
          <p>Đăng ký tài khoản ngay hôm nay để nhận vô vàn ưu đãi hấp dẫn từ ShopVN.</p>
          <button className={styles.midBannerBtn} onClick={() => navigate('/login')}>
            Đăng ký ngay
          </button>
        </div>
      </section>

      {/* 5. SẢN PHẨM BÁN CHẠY */}
      <section className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Sản phẩm bán chạy</h2>
          <Link to="/products?sort=bestseller" className={styles.seeAll}>Xem tất cả</Link>
        </div>

        {!isLoading && (
          <div className={styles.grid}>
            {bestSellers.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

    </div>
  )
}