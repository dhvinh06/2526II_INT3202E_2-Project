import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Header.module.css'

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)
const BagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
    strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M6 7h12l-1 14H7L6 7z" /><path d="M9 7a3 3 0 0 1 6 0" />
  </svg>
)

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) { navigate(`/products?search=${encodeURIComponent(search.trim())}`); setSearch('') }
  }
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>

        {/* LOGO */}
        <Link to="/" className={`${styles.logo} t-tagline`}>ShopVN</Link>

        {/* NAV LINKS */}
        <nav className={styles.navLinks}>
          <Link to="/" className={`${styles.navLink} t-nav-link`}>Trang chủ</Link>
          <Link to="/products" className={`${styles.navLink} t-nav-link`}>Sản phẩm</Link>
        </nav>

        {/* SEARCH */}
        <form className={styles.searchForm} onSubmit={handleSearch}>
          <span className={styles.searchGlyph}><SearchIcon /></span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm sản phẩm"
            className={styles.searchInput}
            aria-label="Tìm kiếm"
          />
        </form>

        {/* RIGHT ACTIONS */}
        <div className={styles.actions}>
          {user?.role === 'SELLER' && <Link to="/seller" className={styles.utilBtn}>Seller</Link>}
          {user?.role === 'ADMIN'  && <Link to="/admin"  className={styles.utilBtn}>Admin</Link>}
          <Link to="/cart" className={styles.iconBtn} aria-label="Giỏ hàng"><BagIcon /></Link>
          {user
            ? <>
                <Link to="/profile" className={`${styles.greeting} t-nav-link`}>
                  Hi, <b>{user.name.split(' ').pop()}</b>
                </Link>
                <button className={styles.utilBtn} onClick={handleLogout}>Đăng xuất</button>
              </>
            : <Link to="/login" className={styles.utilBtn}>Đăng nhập</Link>
          }
          <Link to="/products" className={styles.ctaBtn}>Khám phá</Link>
        </div>

        {/* HAMBURGER */}
        <button className={styles.hamburger} onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <form onSubmit={handleSearch} className={styles.mobileSearch}>
            <span className={styles.searchGlyph}><SearchIcon /></span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm sản phẩm" className={styles.mobileSearchInput} />
          </form>
          <Link to="/" className="t-dense-link" onClick={() => setMenuOpen(false)}>Trang chủ</Link>
          <Link to="/products" className="t-dense-link" onClick={() => setMenuOpen(false)}>Sản phẩm</Link>
          <Link to="/cart" className="t-dense-link" onClick={() => setMenuOpen(false)}>Giỏ hàng</Link>
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
