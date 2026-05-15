import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate, Link } from 'react-router-dom'
import { adminAPI } from '../api'
import styles from './AdminPage.module.css'

export default function AdminPage() {
    const { user } = useAuth()
    const [pendingProducts, setPendingProducts] = useState([])
    const [loading, setLoading] = useState(true)

    if (!user || user.role !== 'ADMIN') return <Navigate to="/" />

    useEffect(() => {
        adminAPI.getPendingProducts()
            .then(setPendingProducts)
            .finally(() => setLoading(false))
    }, [])

    const handleStatus = async (id, status) => {
        await adminAPI.updateProductStatus(id, status)
        setPendingProducts(prev => prev.filter(p => p.id !== id))
    }

    return (
        <div className={styles.page}>
            <div className={styles.breadcrumb}>
                <div className={`${styles.innerBreadcrumb} t-caption`}>
                    <Link to="/">Trang chủ</Link><span>/</span>
                    <span className={styles.currentCrumb}>Quản trị</span>
                </div>
            </div>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className="t-display-md">Duyệt sản phẩm.</h1>
                    <p className={`t-caption ${styles.subtitle}`}>
                        {loading ? 'Đang tải...' : `${pendingProducts.length} sản phẩm chờ duyệt`}
                    </p>
                </div>
                {!loading && pendingProducts.length === 0 && (
                    <div className={styles.emptyState}>
                        <h3 className="t-display-md">Không có sản phẩm nào chờ duyệt</h3>
                        <p className="t-body">Tất cả đã được xử lý.</p>
                    </div>
                )}
                <div className={styles.list}>
                    {pendingProducts.map(p => (
                        <div key={p.id} className={styles.row}>
                            <img src={p.image} alt={p.name} className={`${styles.image} product-shadow`} />
                            <div className={styles.info}>
                                <p className={`t-body-strong ${styles.name}`}>{p.name}</p>
                                <p className={`t-caption ${styles.meta}`}>{p.brandId??'Không có brand'} · {p.categoryId??'Không có danh mục'}</p>
                                <p className={`t-caption ${styles.description}`}>{p.description||'Không có mô tả'}</p>
                                <p className={`t-body-strong ${styles.price}`}>{Number(p.price).toLocaleString('vi-VN')}₫</p>
                            </div>
                            <div className={styles.actions}>
                                <button className="btn-primary" onClick={() => handleStatus(p.id,'APPROVED')}>Duyệt</button>
                                <button className="btn-secondary-pill" onClick={() => handleStatus(p.id,'REJECTED')}>Từ chối</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
