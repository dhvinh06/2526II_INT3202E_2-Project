import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Header.module.css'

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)
const BagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M6 7h12l-1 14H7L6 7z" /><path d="M9 7a3 3 0 0 1 6 0" />
  </svg>
)

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`)
      setSearch('')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const subNavLabel = (() => {
    if (location.pathname.startsWith('/products')) return 'Sản phẩm'
    if (location.pathname.startsWith('/checkout')) return 'Thanh toán'
    if (location.pathname.startsWith('/profile'))  return 'Tài khoản'
    if (location.pathname.startsWith('/seller'))   return 'Seller'
    if (location.pathname.startsWith('/admin'))    return 'Admin'
    return 'ShopVN'
  })()

  return (
    <header className={styles.header}>
      {/* GLOBAL NAV */}
      <div className={styles.globalNav}>
        <div className={styles.globalInner}>
          <Link to="/" className={`${styles.globalLogo} t-tagline`}>ShopVN</Link>
          <nav className={styles.globalLinks}>
            <Link to="/" className="t-nav-link">Trang chủ</Link>
            <Link to="/products" className="t-nav-link">Sản phẩm</Link>
            {user && <Link to="/profile" className="t-nav-link">Tài khoản</Link>}
          </nav>
          <div className={styles.globalRight}>
            {user?.role === 'SELLER' && <Link to="/seller" className="btn-dark-utility">Seller</Link>}
            {user?.role === 'ADMIN'  && <Link to="/admin"  className="btn-dark-utility">Admin</Link>}
            <Link to="/checkout" className={`${styles.iconLink} btn-dark-utility`} aria-label="Giỏ hàng">
              <BagIcon />
            </Link>
            {user
              ? <button className="btn-dark-utility" onClick={handleLogout}>Đăng xuất</button>
              : <Link to="/login" className="btn-dark-utility">Đăng nhập</Link>
            }
            <button className={styles.hamburger} onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>
        </div>
      </div>

      {/* SUB-NAV FROSTED */}
      <div className={styles.subNav}>
        <div className={styles.subInner}>
          <div className={`${styles.subLabel} t-tagline`}>{subNavLabel}</div>
          <form className={styles.searchForm} onSubmit={handleSearch}>
            <span className={styles.searchGlyph}><SearchIcon /></span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm sản phẩm"
              className={`pill-input ${styles.searchInput}`}
              aria-label="Tìm kiếm"
            />
          </form>
          <div className={styles.subRight}>
            {user && (
              <Link to="/profile" className={`${styles.greeting} t-button-utility`}>
                Hi, <b>{user.name.split(' ').pop()}</b>
              </Link>
            )}
            <Link to="/products" className="btn-primary">Khám phá</Link>
          </div>
        </div>
      </div>

      {/* MOBILE TRAY */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <form onSubmit={handleSearch} className={styles.mobileSearch}>
            <span className={styles.searchGlyph}><SearchIcon /></span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm sản phẩm" className={`pill-input ${styles.searchInput}`} />
          </form>
          <Link to="/" className="t-dense-link" onClick={() => setMenuOpen(false)}>Trang chủ</Link>
          <Link to="/products" className="t-dense-link" onClick={() => setMenuOpen(false)}>Sản phẩm</Link>
          <Link to="/checkout" className="t-dense-link" onClick={() => setMenuOpen(false)}>Giỏ hàng</Link>
          {user?.role === 'SELLER' && <Link to="/seller" className="t-dense-link" onClick={() => setMenuOpen(false)}>Seller</Link>}
          {user?.role === 'ADMIN'  && <Link to="/admin"  className="t-dense-link" onClick={() => setMenuOpen(false)}>Admin</Link>}
          {user
            ? <button className="t-dense-link" onClick={() => { handleLogout(); setMenuOpen(false) }}>Đăng xuất</button>
            : <Link to="/login" className="t-dense-link" onClick={() => setMenuOpen(false)}>Đăng nhập</Link>
          }
        </div>
      )}
    </header>
  )
}
