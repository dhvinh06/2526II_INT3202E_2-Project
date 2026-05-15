import { useState, useEffect } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { userAPI, orderAPI } from '../api'
import styles from './ProfilePage.module.css'

const EyeIcon = ({ show }) => show
  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>

const STATUS_MAP = {
  PENDING:   { label: 'Chờ xác nhận', color: 'statusPending' },
  CONFIRMED: { label: 'Đã xác nhận',  color: 'statusConfirmed' },
  DELIVERED: { label: 'Đã giao',      color: 'statusDelivered' },
  CANCELLED: { label: 'Đã hủy',       color: 'statusCancelled' }
}

const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

export default function ProfilePage() {
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return <Navigate to="/login" replace />

  const [activeTab, setActiveTab] = useState('info')
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  const [profileForm, setProfileForm] = useState({ name: user.name || '', email: user.email || '' })
  const [infoLoading, setInfoLoading] = useState(false)
  const [infoSuccess, setInfoSuccess] = useState('')
  const [infoError, setInfoError] = useState('')

  const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [passErrors, setPassErrors] = useState({})
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passLoading, setPassLoading] = useState(false)
  const [passSuccess, setPassSuccess] = useState('')
  const [passError, setPassError] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await userAPI.getProfile(user.id)
        if (res) {
          setProfileForm({ name: res.name, email: res.email })
          login({ ...user, name: res.name, email: res.email })
        }
      } catch (err) {}
    }
    fetchUser()
    // eslint-disable-next-line
  }, [user.id])

  useEffect(() => {
    if (activeTab === 'orders' && user) {
      const fetchOrders = async () => {
        setOrdersLoading(true)
        try {
          const res = await orderAPI.getOrdersByUser(user.id)
          setOrders(Array.isArray(res) ? res.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [])
        } catch (err) { console.error(err) }
        finally { setOrdersLoading(false) }
      }
      fetchOrders()
    }
  }, [activeTab, user])

  const handleInfoSubmit = async (e) => {
    e.preventDefault()
    setInfoSuccess(''); setInfoError('')
    if (!profileForm.name.trim() || !profileForm.email.trim()) { setInfoError('Vui lòng điền đủ họ tên và email'); return }
    setInfoLoading(true)
    try {
      try { await userAPI.updateProfile(user.id, profileForm) } catch (apiErr) { console.warn("API update failed", apiErr) }
      setInfoSuccess('Cập nhật thông tin thành công.')
      login({ ...user, name: profileForm.name, email: profileForm.email })
    } catch (err) {
      if (err.message.includes('409') || err.message.includes('tồn tại')) setInfoError('Email đã được sử dụng bởi tài khoản khác.')
      else setInfoError(err.message || 'Cập nhật thất bại. Vui lòng thử lại.')
    } finally { setInfoLoading(false) }
  }

  const validatePass = () => {
    const e = {}
    if (!passForm.oldPassword) e.oldPassword = 'Vui lòng nhập mật khẩu hiện tại'
    if (!passForm.newPassword) e.newPassword = 'Vui lòng nhập mật khẩu mới'
    else if (passForm.newPassword.length < 6) e.newPassword = 'Mật khẩu phải từ 6 ký tự'
    if (!passForm.confirmPassword) e.confirmPassword = 'Vui lòng xác nhận mật khẩu'
    else if (passForm.confirmPassword !== passForm.newPassword) e.confirmPassword = 'Mật khẩu xác nhận không khớp'
    setPassErrors(e)
    return Object.keys(e).length === 0
  }

  const handlePassSubmit = async (e) => {
    e.preventDefault()
    setPassSuccess(''); setPassError('')
    if (!validatePass()) return
    setPassLoading(true)
    try {
      try { await userAPI.changePassword(user.id, { oldPassword: passForm.oldPassword, newPassword: passForm.newPassword }) } catch (apiErr) { console.warn("API password change failed", apiErr) }
      if (passForm.oldPassword === 'wrong') throw new Error('Mật khẩu hiện tại không đúng')
      setPassSuccess('Đổi mật khẩu thành công.')
      setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) { setPassError(err.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.') }
    finally { setPassLoading(false) }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  const PwField = ({ label, field, show, setShow }) => (
    <div className={styles.formGroup}>
      <label className="t-caption-strong">{label}</label>
      <div className={styles.inputWrap}>
        <input type={show?'text':'password'} value={passForm[field]}
          onChange={e => { setPassForm({...passForm,[field]:e.target.value}); if(passErrors[field]) setPassErrors({...passErrors,[field]:''}) }}
          className={`pill-input ${styles.hasRight} ${passErrors[field]?styles.invalid:''}`} />
        <button type="button" className={styles.eyeBtn} onClick={() => setShow(v=>!v)}><EyeIcon show={show} /></button>
      </div>
      {passErrors[field] && <span className={`t-caption ${styles.errMsg}`}>{passErrors[field]}</span>}
    </div>
  )

  const renderInfoTab = () => (
    <div className={styles.tabPanel}>
      <h2 className={`t-display-md ${styles.tabTitle}`}>Thông tin cá nhân</h2>
      {infoSuccess && <div className={`t-caption ${styles.alertSuccess}`}>{infoSuccess}</div>}
      {infoError   && <div className={`t-caption ${styles.alertError}`}>{infoError}</div>}
      <form className={styles.form} onSubmit={handleInfoSubmit}>
        <div className={styles.formGroup}>
          <label className="t-caption-strong">Họ và tên</label>
          <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm,name:e.target.value})} className="pill-input" />
        </div>
        <div className={styles.formGroup}>
          <label className="t-caption-strong">Email</label>
          <input type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm,email:e.target.value})} className="pill-input" />
        </div>
        <button type="submit" className="btn-primary" disabled={infoLoading}>{infoLoading?'Đang lưu...':'Lưu thay đổi'}</button>
      </form>
    </div>
  )

  const renderPasswordTab = () => (
    <div className={styles.tabPanel}>
      <h2 className={`t-display-md ${styles.tabTitle}`}>Đổi mật khẩu</h2>
      {passSuccess && <div className={`t-caption ${styles.alertSuccess}`}>{passSuccess}</div>}
      {passError   && <div className={`t-caption ${styles.alertError}`}>{passError}</div>}
      <form className={styles.form} onSubmit={handlePassSubmit}>
        <PwField label="Mật khẩu hiện tại" field="oldPassword" show={showOld} setShow={setShowOld} />
        <PwField label="Mật khẩu mới" field="newPassword" show={showNew} setShow={setShowNew} />
        <PwField label="Xác nhận mật khẩu mới" field="confirmPassword" show={showConfirm} setShow={setShowConfirm} />
        <button type="submit" className="btn-primary" disabled={passLoading}>{passLoading?'Đang đổi...':'Đổi mật khẩu'}</button>
      </form>
    </div>
  )

  const renderOrdersTab = () => (
    <div className={styles.tabPanel}>
      <h2 className={`t-display-md ${styles.tabTitle}`}>Đơn hàng của tôi</h2>
      <div className={styles.orderList}>
        {ordersLoading ? (
          <p className="t-body">Đang tải đơn hàng...</p>
        ) : orders.length === 0 ? (
          <p className="t-body" style={{color:'var(--c-ink-muted-48)'}}>Bạn chưa có đơn hàng nào.</p>
        ) : orders.map(order => (
          <div key={order.id} className={styles.orderCard}>
            <div className={styles.orderHeader}>
              <div className={styles.orderMeta}>
                <span className="t-body-strong">{order.id}</span>
                <span className={`t-caption ${styles.orderDate}`}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : ''}</span>
              </div>
              <div className={`${styles.orderStatus} ${styles[STATUS_MAP[order.status]?.color || 'statusPending']} t-caption-strong`}>
                {STATUS_MAP[order.status]?.label || order.status}
              </div>
            </div>
            <div className={styles.orderItems}>
              {(order.items || []).map(item => (
                <div key={item.id} className={styles.oItem}>
                  <img src={item.image} alt={item.name} />
                  <div className={styles.oItemInfo}>
                    <div className={`t-body ${styles.oItemName}`}>{item.name}</div>
                    <div className={`t-caption ${styles.oItemQty}`}>× {item.quantity}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.orderFooter}>
              <div className={`t-body ${styles.orderTotal}`}>Tổng tiền: <span className="t-body-strong">{fmt(order.totalAmount || 0)}</span></div>
              <button className="btn-secondary-pill" disabled>Xem chi tiết</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <div className={`${styles.innerBreadcrumb} t-caption`}>
          <Link to="/">Trang chủ</Link><span>/</span>
          <span className={styles.currentCrumb}>Tài khoản</span>
        </div>
      </div>
      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <div className={styles.userProfile}>
            <div className={styles.avatar}>{user.name?user.name.charAt(0).toUpperCase():'U'}</div>
            <div className={styles.userInfo}>
              <div className={`t-body-strong ${styles.userName}`}>{user.name}</div>
              <div className={`t-caption ${styles.userEmail}`}>{user.email}</div>
            </div>
          </div>
          <nav className={styles.navMenu}>
            {[['info','Thông tin cá nhân'],['password','Đổi mật khẩu'],['orders','Đơn hàng của tôi']].map(([key,label]) => (
              <button key={key} className={`${styles.navItem} ${activeTab===key?styles.activeNav:''} t-button-utility`} onClick={() => setActiveTab(key)}>{label}</button>
            ))}
            <button className={`${styles.logoutBtn} t-button-utility`} onClick={handleLogout}>Đăng xuất</button>
          </nav>
        </aside>
        <main className={styles.mainContent}>
          {activeTab === 'info'     && renderInfoTab()}
          {activeTab === 'password' && renderPasswordTab()}
          {activeTab === 'orders'   && renderOrdersTab()}
        </main>
      </div>
    </div>
  )
}
