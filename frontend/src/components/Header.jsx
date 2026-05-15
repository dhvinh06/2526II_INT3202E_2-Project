import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Header.module.css'



export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
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

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
              <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59L5.25 14c-.16.28-.25.61-.25.96C5 16.1 5.9 17 7 17h14v-2H7.42a.25.25 0 0 1-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 23.46 4H5.21l-.94-2H1z"/>
            </svg>
          </div>
          <span className={styles.logoText}>ShopVN</span>
        </Link>

        {/* Search */}
        <form className={styles.searchForm} onSubmit={handleSearch}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchBtn} aria-label="Tìm kiếm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        </form>

        {/* Right actions */}
        <div className={styles.actions}>
          <Link to="/checkout" className={styles.cartBtn} aria-label="Giỏ hàng">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </Link>
          {user?.role === 'SELLER' && (
              <Link to="/seller" className={styles.btnOutline}>Seller</Link>
          )}
          {user?.role === 'ADMIN' && (
              <Link to="/admin" className={styles.btnOutline}>Admin</Link>
          )}
          {user ? (
            <div className={styles.userWrap}>
              <Link to="/profile" className={styles.greeting}>Hi, <b>{user.name.split(' ').pop()}</b></Link>
              <button className={styles.btnOutline} onClick={handleLogout}>Đăng xuất</button>
            </div>
          ) : (
            <Link to="/login" className={styles.btnOutline}>Đăng nhập</Link>
          )}
        </div>

        {/* Hamburger */}
        <button className={styles.hamburger} onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {user?.role === 'SELLER' && (
              <Link to="/seller" onClick={() => setMenuOpen(false)}>Seller Dashboard</Link>
          )}
          {user?.role === 'ADMIN' && (
              <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin Dashboard</Link>
          )}
          <form onSubmit={handleSearch} className={styles.mobileSearch}>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm..." />
            <button type="submit">Tìm</button>
          </form>
          <Link to="/products" onClick={() => setMenuOpen(false)}>Sản phẩm</Link>
          <Link to="/checkout" onClick={() => setMenuOpen(false)}>Giỏ hàng</Link>
          {user
            ? <button onClick={() => { handleLogout(); setMenuOpen(false) }}>Đăng xuất</button>
            : <Link to="/login" onClick={() => setMenuOpen(false)}>Đăng nhập</Link>
          }
        </div>
      )}
    </header>
  )
}
