import { useAuth } from '../context/AuthContext'
import { Navigate, Link } from 'react-router-dom'
import ProductForm from '../components/ProductForm'
import styles from './SellerPage.module.css'

export default function SellerPage() {
    const { user } = useAuth()
    if (!user || user.role !== 'SELLER') return <Navigate to="/" />

    return (
        <div className={styles.page}>
            <div className={styles.breadcrumb}>
                <div className={`${styles.innerBreadcrumb} t-caption`}>
                    <Link to="/">Trang chủ</Link><span>/</span>
                    <span className={styles.currentCrumb}>Người bán</span>
                </div>
            </div>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className="t-display-md">Đăng sản phẩm mới.</h1>
                    <div className={styles.headerActions}>
                        <p className={`t-caption ${styles.subtitle}`}>Sản phẩm sẽ chờ quản trị viên duyệt trước khi hiển thị.</p>
                        <Link to="/seller/inventory" className="btn-secondary-pill">📦 Quản lý kho hàng</Link>
                    </div>
                </div>
                <ProductForm />
            </div>
        </div>
    )
}
