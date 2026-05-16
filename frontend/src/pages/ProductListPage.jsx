import {useState, useEffect, useMemo} from 'react'
import {useSearchParams, Link} from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import styles from './ProductListPage.module.css'
import {productAPI, categoryAPI} from '../api/index'


const SORT_OPTIONS = [
    {value: 'newest', label: 'Mới nhất'}, {value: 'price_asc', label: 'Giá thấp đến cao'},
    {value: 'price_desc', label: 'Giá cao đến thấp'}, {value: 'bestseller', label: 'Bán chạy nhất'}
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
        minPrice: '', maxPrice: '',
        sortBy: searchParams.get('sort') || 'newest'
    })
    const [categories, setCategories] = useState([{id: 'all', name: 'Tất cả'}])


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
        categoryAPI.getAll().then(data => {
            setCategories([{id: 'all', name: 'Tất cả'}, ...data])
        }).catch(() => {
        })
    }, [])

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true)
            try {
                const data = await productAPI.getProducts({
                    search: filters.search || undefined,
                    categoryId: filters.category !== 'all' ? filters.category : undefined
                })
                setProducts(data ?? [])
            } catch (err) {
                setError('Không thể tải dữ liệu sản phẩm.');
                setProducts([])
            } finally {
                setLoading(false)
            }
        }
        fetchProducts()
    }, [filters.search, filters.category])


    const filteredProducts = useMemo(() => {
        let result = [...products]
        if (filters.search) {
            const s = filters.search.toLowerCase();
            result = result.filter(p => p.name.toLowerCase().includes(s))
        }
        if (filters.minPrice) result = result.filter(p => p.price >= Number(filters.minPrice))
        if (filters.maxPrice) result = result.filter(p => p.price <= Number(filters.maxPrice))
        if (filters.sortBy === 'price_asc') result.sort((a, b) => a.price - b.price)
        else if (filters.sortBy === 'price_desc') result.sort((a, b) => b.price - a.price)
        else if (filters.sortBy === 'bestseller') result.sort((a, b) => b.sold - a.sold)
        else result.sort((a, b) => b.id - a.id)
        return result
    }, [products, filters])

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({...prev, [key]: value}))
        setCurrentPage(1)
        if (key === 'category' || key === 'sortBy') {
            const newParams = new URLSearchParams(searchParams)
            if (value === 'all' && key === 'category') newParams.delete('category')
            else newParams.set(key === 'sortBy' ? 'sort' : key, value)
            setSearchParams(newParams)
        }
    }
    const handlePriceApply = (e) => {
        e.preventDefault();
        const f = e.target;
        handleFilterChange('minPrice', f.min.value);
        handleFilterChange('maxPrice', f.max.value)
    }
    const resetFilters = () => {
        setFilters({search: '', category: 'all', minPrice: '', maxPrice: '', sortBy: 'newest'});
        setSearchParams(new URLSearchParams());
        setCurrentPage(1)
    }

    return (
        <div className={styles.page}>
            <div className={styles.breadcrumb}>
                <div className={`${styles.innerBreadcrumb} t-caption`}>
                    <Link to="/">Trang chủ</Link><span>/</span><span>Sản phẩm</span>
                    {filters.category !== 'all' && <><span>/</span><span
                        className={styles.currentCrumb}>{categories.find(c => c.id === filters.category)?.name}</span></>}
                </div>
            </div>

            <div className={styles.container}>
                <div className={`${styles.overlay} ${isMobileDrawerOpen ? styles.open : ''}`}
                     onClick={() => setIsMobileDrawerOpen(false)}/>

                <aside className={`${styles.sidebar} ${isMobileDrawerOpen ? styles.open : ''}`}>
                    <div className={styles.sidebarHeader}>
                        <h3 className="t-tagline">Bộ lọc</h3>
                        <button className={`${styles.closeBtn} btn-icon-circular`}
                                onClick={() => setIsMobileDrawerOpen(false)}>×
                        </button>
                    </div>
                    <button onClick={resetFilters} className={`${styles.resetLink} text-link`}>Xóa toàn bộ lọc</button>
                    <div className={styles.filterSection}>
                        <h4 className="t-caption-strong">Danh mục</h4>
                        <div className={styles.chipColumn}>
                            {categories.map(cat => (
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
                                <input className="pill-input" type="number" name="min" placeholder="Từ"
                                       defaultValue={filters.minPrice}/>
                                <input className="pill-input" type="number" name="max" placeholder="Đến"
                                       defaultValue={filters.maxPrice}/>
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
                        <button className={`${styles.mobileFilterToggle} btn-dark-utility`}
                                onClick={() => setIsMobileDrawerOpen(true)}>Bộ lọc
                        </button>
                    </div>
                    <div className={`${styles.info} t-caption`}>
                        Hiển
                        thị <b>{Math.min((currentPage - 1) * itemsPerPage + 1, filteredProducts.length)}</b> – <b>{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</b> trong
                        tổng số <b>{filteredProducts.length}</b> sản phẩm
                        {filters.search && ` · kết quả cho "${filters.search}"`}
                    </div>
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
                            <h3 className="t-display-md">Không tìm thấy sản phẩm phù hợp</h3>
                            <p className="t-body">Vui lòng thử lại với từ khóa hoặc bộ lọc khác.</p>
                            <button onClick={resetFilters} className="btn-primary">Xóa toàn bộ bộ lọc</button>
                        </div>
                    ) : (
                        <>
                            <div className={styles.grid}>{paginatedProducts.map(p => <ProductCard key={p.id}
                                                                                                  product={p}/>)}</div>
                            {totalPages > 1 && (
                                <div className={styles.pagination}>
                                    <button className={styles.pageBtn} disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(p => p - 1)}>‹
                                    </button>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button key={i + 1}
                                                className={`${styles.pageBtn} ${currentPage === i + 1 ? styles.pageBtnActive : ''}`}
                                                onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                                    ))}
                                    <button className={styles.pageBtn} disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(p => p + 1)}>›
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
