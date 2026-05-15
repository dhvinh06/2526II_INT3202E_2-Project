import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import ProductCard from '../components/ProductCard'
import { productAPI, categoryAPI } from '../api/index'
import styles from './HomePage.module.css'

// Fallback mock data — chỉ dùng khi API chưa có dữ liệu (demo/dev)
const MOCK_PRODUCTS = [
  { id: 1, name: 'Áo thun nam basic oversize Hàn Quốc', category: 'Thời trang', price: 149000, originalPrice: 220000, rating: 4.8, sold: 2104, image: 'https://picsum.photos/seed/pr1/400/400' },
  { id: 2, name: 'Tai nghe Bluetooth ANC chống ồn', category: 'Điện tử', price: 890000, originalPrice: 1290000, rating: 4.7, sold: 687, image: 'https://picsum.photos/seed/pr2/400/400' },
  { id: 3, name: 'Váy hoa maxi dáng dài nữ tính', category: 'Thời trang', price: 289000, originalPrice: 420000, rating: 4.7, sold: 856, image: 'https://picsum.photos/seed/pr3/400/400' },
  { id: 4, name: 'Bình giữ nhiệt inox 316 500ml', category: 'Gia dụng', price: 245000, originalPrice: 320000, rating: 4.9, sold: 3102, image: 'https://picsum.photos/seed/pr4/400/400' },
  { id: 5, name: 'Giày sneaker nam nữ đế êm thoáng khí', category: 'Thời trang', price: 520000, originalPrice: 650000, rating: 4.6, sold: 1432, image: 'https://picsum.photos/seed/pr5/400/400' },
  { id: 6, name: 'Đồng hồ thông minh đo sức khoẻ', category: 'Điện tử', price: 1250000, originalPrice: 1890000, rating: 4.5, sold: 312, image: 'https://picsum.photos/seed/pr6/400/400' },
  { id: 7, name: 'Loa Bluetooth mini chống nước IPX7', category: 'Điện tử', price: 450000, originalPrice: 680000, rating: 4.8, sold: 920, image: 'https://picsum.photos/seed/pr7/400/400' },
  { id: 8, name: 'Nồi chiên không dầu 5L digital', category: 'Gia dụng', price: 1490000, originalPrice: 2200000, rating: 4.6, sold: 445, image: 'https://picsum.photos/seed/pr8/400/400' },
  { id: 9, name: 'Bộ dưỡng da 5 bước cho da dầu', category: 'Làm đẹp', price: 450000, originalPrice: 650000, rating: 4.7, sold: 780, image: 'https://picsum.photos/seed/pr9/400/400' },
  { id: 10, name: 'Son môi matte lì 24h siêu bền màu', category: 'Làm đẹp', price: 120000, originalPrice: 185000, rating: 4.8, sold: 5200, image: 'https://picsum.photos/seed/pr10/400/400' },
  { id: 11, name: 'Sách Đắc Nhân Tâm bản mới 2024', category: 'Sách', price: 78000, originalPrice: 95000, rating: 4.9, sold: 8900, image: 'https://picsum.photos/seed/pr11/400/400' },
  { id: 12, name: 'Balo laptop chống nước 15.6"', category: 'Phụ kiện', price: 380000, originalPrice: 450000, rating: 4.6, sold: 1023, image: 'https://picsum.photos/seed/pr12/400/400' }
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
        // Nếu API trả về rỗng hoặc lỗi silent → fallback mock
        setProducts(data?.length > 0 ? data : MOCK_PRODUCTS)
      } catch (err) {
        setError(err.message)
        setProducts(MOCK_PRODUCTS) // fallback để trang không trắng khi demo
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