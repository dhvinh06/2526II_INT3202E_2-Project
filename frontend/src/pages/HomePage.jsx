import {Link, useNavigate} from 'react-router-dom'
import {useState, useEffect} from 'react'
import ProductCard from '../components/ProductCard'
import {productAPI, categoryAPI} from '../api/index'
import {useAuth} from '../context/AuthContext'
import styles from './HomePage.module.css'

export default function HomePage() {
    const {user} = useAuth()
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
                setProducts(data ?? [])
            } catch (err) {
                setError(err.message);
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
                    if (!map[c.parentId]) map[c.parentId] = [];
                    map[c.parentId].push(c)
                })
                setParentCategories(parents);
                setChildrenMap(map)
            } catch (err) {
                console.error('Lỗi fetch categories:', err)
            }
        }
        fetchCategories()
    }, [])

    const handleParentClick = (parentId) => setSelectedParentId(prev => prev === parentId ? null : parentId)
    const recommendedProducts = products.slice(0, 8)
    const bestSellers = [...products].sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0)).slice(0, 8)

    return (
        <div className={styles.page}>

            {/* 1. HERO */}
            <section className={styles.tileLight}>
                <div className={styles.tileInner}>
                    <h1 className={`t-hero-display ${styles.heroTitle}`}>
                        Mua sắm thả ga.<br/><span className={styles.heroAccent}>Giá cả phải chăng.</span>
                    </h1>
                    <p className={`t-lead ${styles.heroLead}`}>Hàng ngàn sản phẩm chất lượng, giao hàng nhanh toàn
                        quốc.</p>
                    <div className={styles.ctaRow}>
                        <button className="btn-primary" onClick={() => navigate('/products')}>Khám phá ngay</button>
                        <button className="btn-secondary-pill" onClick={() => navigate('/products?sort=bestseller')}>Xem
                            bán chạy
                        </button>
                    </div>
                    <div className={styles.heroImageWrap}>
                        <img className={`${styles.heroImage} product-shadow`}
                             src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=720&q=80"
                             alt="Hero – Giày sneaker"/>
                    </div>
                </div>
            </section>

            {/* 2. CATEGORIES */}
            <section className={styles.tileParchment}>
                <div className={styles.containerWide}>
                    <h2 className={`t-display-lg ${styles.sectionTitle}`}>Danh mục nổi bật.</h2>
                    <div className={styles.categoryRow}>
                        {parentCategories.map(cat => (
                            <button key={cat.id} type="button"
                                    className={`${styles.categoryCard} ${selectedParentId === cat.id ? styles.categoryCardSelected : ''}`}
                                    onClick={() => handleParentClick(cat.id)}>
                                <div className={styles.catIcon}>{cat.icon ?? cat.name?.charAt(0)}</div>
                                <div className={`t-caption-strong ${styles.catName}`}>{cat.name}</div>
                            </button>
                        ))}
                    </div>
                    {selectedParentId && childrenMap[selectedParentId] && (
                        <div className={styles.childList}>
                            {childrenMap[selectedParentId].map(child => (
                                <button key={child.id} type="button" className={`${styles.childChip} t-caption`}
                                        onClick={() => navigate(`/products?categoryId=${child.id}`)}>{child.name}</button>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* 3. RECOMMENDED */}
            <section className={styles.tileLight}>
                <div className={styles.containerWide}>
                    <div className={styles.sectionHeader}>
                        <h2 className="t-display-lg">Sản phẩm đề xuất.</h2>
                        <Link to="/products" className="text-link">Xem tất cả ›</Link>
                    </div>
                    {isLoading && <p className="t-body">Đang tải sản phẩm...</p>}
                    {!isLoading && error &&
                        <p className="t-body" style={{color: 'var(--c-ink-muted-48)'}}>Lỗi: {error}</p>}
                    {!isLoading && <div className={styles.grid}>{recommendedProducts.map(p => <ProductCard key={p.id}
                                                                                                           product={p}/>)}</div>}
                </div>
            </section>

            {/* 4. MID DARK (guest only) */}
            {!user && (
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
            )}

            {/* 5. BESTSELLERS */}
            <section className={styles.tileLight}>
                <div className={styles.containerWide}>
                    <div className={styles.sectionHeader}>
                        <h2 className="t-display-lg">Sản phẩm bán chạy.</h2>
                        <Link to="/products?sort=bestseller" className="text-link">Xem tất cả ›</Link>
                    </div>
                    {!isLoading && <div className={styles.grid}>{bestSellers.map(p => <ProductCard key={p.id}
                                                                                                   product={p}/>)}</div>}
                </div>
            </section>

        </div>
    )
}
