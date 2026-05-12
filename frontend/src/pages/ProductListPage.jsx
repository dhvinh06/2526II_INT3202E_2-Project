import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { productAPI } from '../api'
import ProductCard from '../components/ProductCard'
import styles from './ProductListPage.module.css'

// 12 Mock Products
const MOCK_PRODUCTS = [
  { id: 1, name: 'Áo thun nam basic oversize Hàn Quốc', category: 'fashion', price: 149000, originalPrice: 220000, rating: 4.8, sold: 2104, image: 'https://picsum.photos/seed/pr1/400/400' },
  { id: 2, name: 'Tai nghe Bluetooth ANC chống ồn', category: 'electronics', price: 890000, originalPrice: 1290000, rating: 4.7, sold: 687, image: 'https://picsum.photos/seed/pr2/400/400' },
  { id: 3, name: 'Váy hoa maxi dáng dài nữ tính', category: 'fashion', price: 289000, originalPrice: 420000, rating: 4.7, sold: 856, image: 'https://picsum.photos/seed/pr3/400/400' },
  { id: 4, name: 'Bình giữ nhiệt inox 316 500ml', category: 'home', price: 245000, originalPrice: 320000, rating: 4.9, sold: 3102, image: 'https://picsum.photos/seed/pr4/400/400' },
  { id: 5, name: 'Giày sneaker nam nữ đế êm thoáng khí', category: 'fashion', price: 520000, originalPrice: 650000, rating: 4.6, sold: 1432, image: 'https://picsum.photos/seed/pr5/400/400' },
  { id: 6, name: 'Đồng hồ thông minh đo sức khoẻ', category: 'electronics', price: 1250000, originalPrice: 1890000, rating: 4.5, sold: 312, image: 'https://picsum.photos/seed/pr6/400/400' },
  { id: 7, name: 'Loa Bluetooth mini chống nước IPX7', category: 'electronics', price: 450000, originalPrice: 680000, rating: 4.8, sold: 920, image: 'https://picsum.photos/seed/pr7/400/400' },
  { id: 8, name: 'Nồi chiên không dầu 5L digital', category: 'home', price: 1490000, originalPrice: 2200000, rating: 4.6, sold: 445, image: 'https://picsum.photos/seed/pr8/400/400' },
  { id: 9, name: 'Bộ dưỡng da 5 bước cho da dầu', category: 'beauty', price: 450000, originalPrice: 650000, rating: 4.7, sold: 780, image: 'https://picsum.photos/seed/pr9/400/400' },
  { id: 10, name: 'Son môi matte lì 24h siêu bền màu', category: 'beauty', price: 120000, originalPrice: 185000, rating: 4.8, sold: 5200, image: 'https://picsum.photos/seed/pr10/400/400' },
  { id: 11, name: 'Sách Đắc Nhân Tâm bản mới 2024', category: 'books', price: 78000, originalPrice: 95000, rating: 4.9, sold: 8900, image: 'https://picsum.photos/seed/pr11/400/400' },
  { id: 12, name: 'Balo laptop chống nước 15.6"', category: 'accessories', price: 380000, originalPrice: 450000, rating: 4.6, sold: 1023, image: 'https://picsum.photos/seed/pr12/400/400' },
  { id: 13, name: 'Bàn phím cơ không dây RGB', category: 'electronics', price: 650000, originalPrice: 850000, rating: 4.8, sold: 412, image: 'https://picsum.photos/seed/pr13/400/400' },
  { id: 14, name: 'Áo khoác dù chống nắng UV', category: 'fashion', price: 199000, originalPrice: 250000, rating: 4.5, sold: 1800, image: 'https://picsum.photos/seed/pr14/400/400' }
]

const CATEGORIES = [
  { id: 'all', name: 'Tất cả' },
  { id: 'fashion', name: 'Thời trang' },
  { id: 'electronics', name: 'Điện tử' },
  { id: 'home', name: 'Gia dụng' },
  { id: 'beauty', name: 'Làm đẹp' },
  { id: 'books', name: 'Sách' },
  { id: 'accessories', name: 'Phụ kiện' }
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá thấp đến cao' },
  { value: 'price_desc', label: 'Giá cao đến thấp' },
  { value: 'bestseller', label: 'Bán chạy nhất' }
]

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  
  // States
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Filter States
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'all',
    minPrice: '',
    maxPrice: '',
    sortBy: searchParams.get('sort') || 'newest'
  })

  // Sync params to filters when URL changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || 'all',
      sortBy: searchParams.get('sort') || 'newest'
    }))
    setCurrentPage(1)
  }, [searchParams])

  // Fetch or mock
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const data = await productAPI.getProducts({ 
          search: filters.search || undefined,
          categoryId: filters.category !== 'all' ? filters.category : undefined
        })
        if (data && data.length > 0) {
          setProducts(data)
        } else {
          setProducts(MOCK_PRODUCTS)
        }
      } catch (err) {
        console.error("API error, falling back to mock data", err)
        setError('Không thể tải dữ liệu sản phẩm.')
        setProducts(MOCK_PRODUCTS) // Fallback to mock on error
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Derived state (Filtering & Sorting)
  const filteredProducts = useMemo(() => {
    let result = [...products]

    if (filters.search) {
      const s = filters.search.toLowerCase()
      result = result.filter(p => p.name.toLowerCase().includes(s))
    }

    if (filters.category && filters.category !== 'all') {
      result = result.filter(p => p.category === filters.category)
    }

    if (filters.minPrice) {
      result = result.filter(p => p.price >= Number(filters.minPrice))
    }

    if (filters.maxPrice) {
      result = result.filter(p => p.price <= Number(filters.maxPrice))
    }

    if (filters.sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price)
    } else if (filters.sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price)
    } else if (filters.sortBy === 'bestseller') {
      result.sort((a, b) => b.sold - a.sold)
    } else {
      // newest - mock id is auto increment so sort descending
      result.sort((a, b) => b.id - a.id)
    }

    return result
  }, [products, filters])

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
    
    // Update URL logic (optional based on your need, keeping it simple here)
    if (key === 'category' || key === 'sortBy') {
      const newParams = new URLSearchParams(searchParams)
      if (value === 'all' && key === 'category') newParams.delete('category')
      else newParams.set(key === 'sortBy' ? 'sort' : key, value)
      setSearchParams(newParams)
    }
  }

  const handlePriceApply = (e) => {
    e.preventDefault()
    const form = e.target
    handleFilterChange('minPrice', form.min.value)
    handleFilterChange('maxPrice', form.max.value)
  }

  const resetFilters = () => {
    setFilters({ search: '', category: 'all', minPrice: '', maxPrice: '', sortBy: 'newest' })
    setSearchParams(new URLSearchParams())
    setCurrentPage(1)
  }

  return (
    <div className={styles.page}>
      
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <div className={styles.innerBreadcrumb}>
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <span>Sản phẩm</span>
          {filters.category !== 'all' && (
            <>
              <span>/</span>
              <span className={styles.currentCrumb}>
                {CATEGORIES.find(c => c.id === filters.category)?.name}
              </span>
            </>
          )}
        </div>
      </div>

      <div className={styles.container}>
        {/* Mobile Filter Overlay */}
        <div 
          className={`${styles.overlay} ${isMobileDrawerOpen ? styles.open : ''}`} 
          onClick={() => setIsMobileDrawerOpen(false)}
        />

        {/* SIDEBAR */}
        <aside className={`${styles.sidebar} ${isMobileDrawerOpen ? styles.open : ''}`}>
          <div className={styles.sidebarHeader}>
            <h3>Bộ lọc</h3>
            <button className={styles.resetBtn} onClick={resetFilters}>Xóa lọc</button>
            <button className={styles.closeBtn} onClick={() => setIsMobileDrawerOpen(false)}>✕</button>
          </div>

          <div className={styles.filterSection}>
            <h4>Danh mục</h4>
            <div className={styles.radioList}>
              {CATEGORIES.map(cat => (
                <label key={cat.id} className={styles.radioItem}>
                  <input 
                    type="radio" 
                    name="category" 
                    value={cat.id}
                    checked={filters.category === cat.id}
                    onChange={() => handleFilterChange('category', cat.id)}
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.filterSection}>
            <h4>Khoảng giá (VNĐ)</h4>
            <form onSubmit={handlePriceApply} className={styles.priceForm}>
              <div className={styles.priceInputs}>
                <input type="number" name="min" placeholder="Từ" defaultValue={filters.minPrice} />
                <span>-</span>
                <input type="number" name="max" placeholder="Đến" defaultValue={filters.maxPrice} />
              </div>
              <button type="submit" className={styles.applyBtn}>Áp dụng</button>
            </form>
          </div>

          <div className={styles.filterSection}>
            <h4>Sắp xếp</h4>
            <select 
              className={styles.sortSelectMobile}
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className={styles.main}>
          <div className={styles.toolbar}>
            <div className={styles.info}>
              Hiển thị <b>{Math.min((currentPage - 1) * itemsPerPage + 1, filteredProducts.length)}</b> - 
              <b>{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</b> trong tổng số 
              <b> {filteredProducts.length}</b> sản phẩm
              {filters.search && ` kết quả cho "${filters.search}"`}
            </div>
            
            <div className={styles.toolbarRight}>
              <button 
                className={styles.mobileFilterToggle} 
                onClick={() => setIsMobileDrawerOpen(true)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                Bộ lọc
              </button>
              
              <select 
                className={styles.sortSelect}
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid / Loading / Empty */}
          {loading ? (
            <div className={styles.grid}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.skeletonImg}></div>
                  <div className={styles.skeletonText} style={{width: '80%'}}></div>
                  <div className={styles.skeletonText} style={{width: '50%'}}></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className={styles.emptyState}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <h3>Không tìm thấy sản phẩm phù hợp</h3>
              <p>Vui lòng thử lại với từ khóa hoặc bộ lọc khác.</p>
              <button onClick={resetFilters} className={styles.resetBtnLarge}>Xóa toàn bộ bộ lọc</button>
            </div>
          ) : (
            <>
              <div className={styles.grid}>
                {paginatedProducts.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button 
                    disabled={currentPage === 1} 
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    ❮
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button 
                      key={i + 1} 
                      className={currentPage === i + 1 ? styles.activePage : ''}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button 
                    disabled={currentPage === totalPages} 
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    ❯
                  </button>
                </div>
              )}
            </>
          )}

        </main>
      </div>
    </div>
  )
}
