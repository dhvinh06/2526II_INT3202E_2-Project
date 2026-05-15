import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { productAPI } from '../api'
import ProductCard from '../components/ProductCard'
import styles from './ProductListPage.module.css'

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
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'all',
    minPrice: '',
    maxPrice: '',
    sortBy: searchParams.get('sort') || 'newest'
  })

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || 'all',
      sortBy: searchParams.get('sort') || 'newest'
    }))
    setCurrentPage(1)
  }, [searchParams])

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const data = await productAPI.getProducts({
          search: filters.search || undefined,
          categoryId: filters.category !== 'all' ? filters.category : undefined
        })
        setProducts(data && data.length > 0 ? data : MOCK_PRODUCTS)
      } catch (err) {
        setError('Không thể tải dữ liệu sản phẩm.')
        setProducts(MOCK_PRODUCTS)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    let result = [...products]
    if (filters.search) { const s = filters.search.toLowerCase(); result = result.filter(p => p.name.toLowerCase().includes(s)) }
    if (filters.category && filters.category !== 'all') result = result.filter(p => p.category === filters.category)
    if (filters.minPrice) result = result.filter(p => p.price >= Number(filters.minPrice))
    if (filters.maxPrice) result = result.filter(p => p.price <= Number(filters.maxPrice))
    if (filters.sortBy === 'price_asc') result.sort((a,b) => a.price - b.price)
    else if (filters.sortBy === 'price_desc') result.sort((a,b) => b.price - a.price)
    else if (filters.sortBy === 'bestseller') result.sort((a,b) => b.sold - a.sold)
    else result.sort((a,b) => b.id - a.id)
    return result
  }, [products, filters])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1
  const paginatedProducts = filteredProducts.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage)

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
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
      <div className={styles.breadcrumb}>
        <div className={`${styles.innerBreadcrumb} t-caption`}>
          <Link to="/">Trang chủ</Link><span>/</span><span>Sản phẩm</span>
          {filters.category !== 'all' && <><span>/</span><span className={styles.currentCrumb}>{CATEGORIES.find(c => c.id === filters.category)?.name}</span></>}
        </div>
      </div>

      <div className={styles.container}>
        <div className={`${styles.overlay} ${isMobileDrawerOpen ? styles.open : ''}`} onClick={() => setIsMobileDrawerOpen(false)} />

        <aside className={`${styles.sidebar} ${isMobileDrawerOpen ? styles.open : ''}`}>
          <div className={styles.sidebarHeader}>
            <h3 className="t-tagline">Bộ lọc</h3>
            <button className={`${styles.closeBtn} btn-icon-circular`} onClick={() => setIsMobileDrawerOpen(false)}>×</button>
          </div>
          <button onClick={resetFilters} className={`${styles.resetLink} text-link`}>Xóa toàn bộ lọc</button>

          <div className={styles.filterSection}>
            <h4 className="t-caption-strong">Danh mục</h4>
            <div className={styles.chipColumn}>
              {CATEGORIES.map(cat => (
                <button key={cat.id} type="button"
                  className={`${styles.optionChip} ${filters.category === cat.id ? styles.optionChipSelected : ''} t-caption`}
                  onClick={() => handleFilterChange('category', cat.id)}>{cat.name}</button>
              ))}
            </div>
          </div>

          <div className={styles.filterSection}>
            <h4 className="t-caption-strong">Khoảng giá (VNĐ)</h4>
            <form onSubmit={handlePriceApply} className={styles.priceForm}>
              <div className={styles.priceInputs}>
                <input className="pill-input" type="number" name="min" placeholder="Từ" defaultValue={filters.minPrice} />
                <input className="pill-input" type="number" name="max" placeholder="Đến" defaultValue={filters.maxPrice} />
              </div>
              <button type="submit" className="btn-primary">Áp dụng</button>
            </form>
          </div>

          <div className={styles.filterSection}>
            <h4 className="t-caption-strong">Sắp xếp</h4>
            <div className={styles.chipColumn}>
              {SORT_OPTIONS.map(opt => (
                <button key={opt.value} type="button"
                  className={`${styles.optionChip} ${filters.sortBy === opt.value ? styles.optionChipSelected : ''} t-caption`}
                  onClick={() => handleFilterChange('sortBy', opt.value)}>{opt.label}</button>
              ))}
            </div>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.headerRow}>
            <h1 className="t-display-md">Sản phẩm</h1>
            <button className={`${styles.mobileFilterToggle} btn-dark-utility`} onClick={() => setIsMobileDrawerOpen(true)}>Bộ lọc</button>
          </div>
          <div className={`${styles.info} t-caption`}>
            Hiển thị <b>{Math.min((currentPage-1)*itemsPerPage+1, filteredProducts.length)}</b> – <b>{Math.min(currentPage*itemsPerPage, filteredProducts.length)}</b> trong tổng số <b>{filteredProducts.length}</b> sản phẩm
            {filters.search && ` · kết quả cho "${filters.search}"`}
          </div>

          {loading ? (
            <div className={styles.grid}>
              {[...Array(8)].map((_,i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.skeletonImg}></div>
                  <div className={styles.skeletonText} style={{width:'80%'}}></div>
                  <div className={styles.skeletonText} style={{width:'50%'}}></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className={styles.emptyState}>
              <h3 className="t-display-md">Không tìm thấy sản phẩm phù hợp</h3>
              <p className="t-body">Vui lòng thử lại với từ khóa hoặc bộ lọc khác.</p>
              <button onClick={resetFilters} className="btn-primary">Xóa toàn bộ bộ lọc</button>
            </div>
          ) : (
            <>
              <div className={styles.grid}>
                {paginatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button className={styles.pageBtn} disabled={currentPage===1} onClick={() => setCurrentPage(p=>p-1)}>‹</button>
                  {[...Array(totalPages)].map((_,i) => (
                    <button key={i+1} className={`${styles.pageBtn} ${currentPage===i+1?styles.pageBtnActive:''}`} onClick={() => setCurrentPage(i+1)}>{i+1}</button>
                  ))}
                  <button className={styles.pageBtn} disabled={currentPage===totalPages} onClick={() => setCurrentPage(p=>p+1)}>›</button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
