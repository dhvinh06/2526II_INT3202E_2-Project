import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import { adminAPI } from '../api'

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
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, fontWeight: 500 }}>Duyệt sản phẩm</h2>
                <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)', fontSize: 14 }}>
                    {loading ? 'Đang tải...' : `${pendingProducts.length} sản phẩm chờ duyệt`}
                </p>
            </div>

            {!loading && pendingProducts.length === 0 && (
                <div style={{
                    textAlign: 'center', padding: '3rem',
                    color: 'var(--color-text-secondary)',
                    border: '0.5px solid var(--color-border-tertiary)',
                    borderRadius: 'var(--border-radius-lg)'
                }}>
                    Không có sản phẩm nào chờ duyệt
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pendingProducts.map(p => (
                    <div key={p.id} style={{
                        display: 'flex', gap: 16, alignItems: 'flex-start',
                        background: 'var(--color-background-primary)',
                        border: '0.5px solid var(--color-border-tertiary)',
                        borderRadius: 'var(--border-radius-lg)',
                        padding: '1rem 1.25rem'
                    }}>
                        <img
                            src={p.image}
                            alt={p.name}
                            style={{
                                width: 80, height: 80, objectFit: 'cover',
                                borderRadius: 'var(--border-radius-md)',
                                flexShrink: 0,
                                border: '0.5px solid var(--color-border-tertiary)'
                            }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: '0 0 2px', fontWeight: 500, fontSize: 15 }}>{p.name}</p>
                            <p style={{ margin: '0 0 4px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                                {p.brandId ?? 'Không có brand'} · {p.categoryId ?? 'Không có danh mục'}
                            </p>
                            <p style={{ margin: '0 0 8px', fontSize: 14, color: 'var(--color-text-secondary)',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {p.description || 'Không có mô tả'}
                            </p>
                            <p style={{ margin: 0, fontWeight: 500, fontSize: 15 }}>
                                {Number(p.price).toLocaleString('vi-VN')}₫
                            </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                            <button
                                onClick={() => handleStatus(p.id, 'APPROVED')}
                                style={{
                                    padding: '6px 16px', fontSize: 13, cursor: 'pointer',
                                    background: 'var(--color-background-success)',
                                    color: 'var(--color-text-success)',
                                    border: '0.5px solid var(--color-border-success)',
                                    borderRadius: 'var(--border-radius-md)'
                                }}>
                                Duyệt
                            </button>
                            <button
                                onClick={() => handleStatus(p.id, 'REJECTED')}
                                style={{
                                    padding: '6px 16px', fontSize: 13, cursor: 'pointer',
                                    background: 'var(--color-background-danger)',
                                    color: 'var(--color-text-danger)',
                                    border: '0.5px solid var(--color-border-danger)',
                                    borderRadius: 'var(--border-radius-md)'
                                }}>
                                Từ chối
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}