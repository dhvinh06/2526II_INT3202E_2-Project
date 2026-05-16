import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate, Link } from 'react-router-dom'
import { productAPI } from '../api'
import styles from './InventoryPage.module.css'

export default function InventoryPage() {
    const { user } = useAuth()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    if (!user || (user.role !== 'SELLER' && user.role !== 'ADMIN')) return <Navigate to="/" />

    useEffect(() => {
        if (!user) return
        setLoading(true)
        productAPI.getBySeller(user.id, search)
            .then(data => {
                setProducts(data)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [user, search])

    const handleSearch = (e) => {
        e.preventDefault()
    }

    const handleRestock = async (id, currentStock) => {
        const input = window.prompt(`Nhập số lượng hàng thêm vào (hiện tại: ${currentStock}):`, '10')
        if (input === null) return
        
        const change = parseInt(input)
        if (isNaN(change)) {
            alert('Vui lòng nhập một con số hợp lệ.')
            return
        }

        try {
            await productAPI.updateStock(id, change, user.id)
            alert('Cập nhật kho thành công!')
            setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: p.stock + change } : p))
        } catch (err) {
            alert('Lỗi cập nhật kho: ' + err.message)
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.breadcrumb}>
                <div className={`${styles.innerBreadcrumb} t-caption`}>
                    <Link to="/">Trang chủ</Link><span>/</span>
                    <Link to="/seller">Người bán</Link><span>/</span>
                    <span className={styles.currentCrumb}>Quản lý kho</span>
                </div>
            </div>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className="t-display-md">Quản lý kho hàng.</h1>
                    <form onSubmit={handleSearch} className={styles.searchBox}>
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm sản phẩm để nhập hàng..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pill-input"
                        />
                        <button type="submit" className="btn-primary">Tìm</button>
                    </form>
                </div>

                {loading ? (
                    <p className="t-body">Đang tải...</p>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr className="t-caption-strong">
                                    <th>Sản phẩm</th>
                                    <th>Giá</th>
                                    <th>Tồn kho</th>
                                    <th>Đã bán</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p.id}>
                                        <td>
                                            <div className={styles.productCell}>
                                                <img src={p.image} alt={p.name} className={styles.thumb} />
                                                <span className="t-body-strong">{p.name}</span>
                                            </div>
                                        </td>
                                        <td className="t-body">{Number(p.price).toLocaleString('vi-VN')}₫</td>
                                        <td className="t-body-strong" style={{ color: p.stock < 10 ? 'var(--c-primary)' : 'inherit' }}>
                                            {p.stock}
                                        </td>
                                        <td className="t-body">{p.sold}</td>
                                        <td>
                                            <button 
                                                className="btn-secondary-pill" 
                                                onClick={() => handleRestock(p.id, p.stock)}
                                            >
                                                📦 Nhập thêm hàng
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
