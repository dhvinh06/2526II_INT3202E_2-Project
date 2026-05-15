import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link, useLocation } from 'react-router-dom'
import { productAPI } from '../api'
import ProductCard from '../components/ProductCard'
import styles from './ProductListPage.module.css'

// Đã xóa MOCK_PRODUCTS

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
  const location = useLocation()

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
  }, [location.search])

  // Fetch from backend whenever URL changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const queryParams = new URLSearchParams(location.search)
        const currentSearch = queryParams.get('search') || undefined
        const currentCat = queryParams.get('category')
        
        const data = await productAPI.getProducts({
          search: currentSearch,
          categoryId: currentCat && currentCat !== 'all' ? currentCat : undefined
        })
        
        if (data && data.length > 0) {
          setProducts(data)
        } else {
          setProducts([])
        }
      } catch (err) {
        console.error("API error", err)
        setError('Không thể tải dữ liệu sản phẩm.')
        setProducts([]) 
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [location.search])

  // Derived state (Filtering & Sorting)
  const filteredProducts = useMemo(() => {
    let result = [...products]

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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
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
                  <div className={styles.skeletonText} style={{ width: '80%' }}></div>
                  <div className={styles.skeletonText} style={{ width: '50%' }}></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className={styles.emptyState}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
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
