import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../api'
import styles from './Login.module.css'

const EyeIcon = ({ show }) => show
  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function InputGroup({ label, type='text', value, onChange, error, placeholder, rightAction }) {
  return (
    <div className={styles.formGroup}>
      <label className="t-caption-strong">{label}</label>
      <div className={styles.inputWrap}>
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className={`pill-input ${error ? styles.invalid : ''} ${rightAction ? styles.hasRight : ''}`} />
        {rightAction}
      </div>
      {error && <span className={`t-caption ${styles.errMsg}`}>{error}</span>}
    </div>
  )
}

function LoginForm() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!email) errs.email = 'Vui lòng nhập email'
    else if (!emailRegex.test(email)) errs.email = 'Email không đúng định dạng'
    if (!password) errs.password = 'Vui lòng nhập mật khẩu'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!validate()) return
    setLoading(true)
    try {
      const res = await authAPI.login({ email, password })
      login(res)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Đã có lỗi xảy ra, thử lại sau')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={`t-caption ${styles.alertError}`}>{error}</div>}
      <InputGroup label="Email" value={email} onChange={setEmail} error={fieldErrors.email} placeholder="Nhập email của bạn" />
      <InputGroup label="Mật khẩu" type={showPassword?'text':'password'} value={password} onChange={setPassword}
        error={fieldErrors.password} placeholder="Nhập mật khẩu"
        rightAction={<button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}><EyeIcon show={showPassword} /></button>} />
      <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading}>
        {loading ? 'Đang xử lý...' : 'Đăng nhập'}
      </button>
    </form>
  )
}

function RegisterForm({ onSuccess }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('CUSTOMER')
  const [adminSecret, setAdminSecret] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const ROLES = [
    { value: 'CUSTOMER', label: 'Khách hàng' },
    { value: 'SELLER',   label: 'Người bán'  },
    { value: 'ADMIN',    label: 'Quản trị viên' },
  ]

  const validate = () => {
    const errs = {}
    if (!name.trim()) errs.name = 'Vui lòng nhập họ tên'
    if (!email) errs.email = 'Vui lòng nhập email'
    else if (!emailRegex.test(email)) errs.email = 'Email không đúng định dạng'
    if (!password) errs.password = 'Vui lòng nhập mật khẩu'
    else if (password.length < 6) errs.password = 'Mật khẩu ít nhất 6 ký tự'
    if (!confirmPassword) errs.confirmPassword = 'Vui lòng xác nhận mật khẩu'
    else if (confirmPassword !== password) errs.confirmPassword = 'Mật khẩu xác nhận không khớp'
    if (role === 'ADMIN' && !adminSecret.trim()) errs.adminSecret = 'Vui lòng nhập mã xác nhận'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!validate()) return
    setLoading(true)
    try {
      await authAPI.register({ name, email, password, role, adminSecret: role==='ADMIN'?adminSecret:undefined })
      setSuccess('Đăng ký thành công!')
      setTimeout(() => onSuccess(), 1500)
    } catch (err) {
      setError(err.message || 'Đã có lỗi xảy ra, thử lại sau')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error   && <div className={`t-caption ${styles.alertError}`}>{error}</div>}
      {success && <div className={`t-caption ${styles.alertSuccess}`}>{success}</div>}
      <div className={styles.formGroup}>
        <label className="t-caption-strong">Loại tài khoản</label>
        <div className={styles.roleSegment}>
          {ROLES.map(r => (
            <button key={r.value} type="button"
              className={`${styles.roleBtn} ${role===r.value?styles.roleActive:''} t-caption`}
              onClick={() => { setRole(r.value); setAdminSecret('') }}>{r.label}</button>
          ))}
        </div>
      </div>
      {role === 'ADMIN' && (
        <InputGroup label="Mã xác nhận Admin" type={showSecret?'text':'password'} value={adminSecret}
          onChange={setAdminSecret} error={fieldErrors.adminSecret} placeholder="Nhập mã bí mật"
          rightAction={<button type="button" className={styles.eyeBtn} onClick={() => setShowSecret(v=>!v)}><EyeIcon show={showSecret} /></button>} />
      )}
      <InputGroup label="Họ tên" value={name} onChange={setName} error={fieldErrors.name} placeholder="Nguyễn Văn A" />
      <InputGroup label="Email" value={email} onChange={setEmail} error={fieldErrors.email} placeholder="example@email.com" />
      <InputGroup label="Mật khẩu" type={showPassword?'text':'password'} value={password} onChange={setPassword}
        error={fieldErrors.password} placeholder="Ít nhất 6 ký tự"
        rightAction={<button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(v=>!v)}><EyeIcon show={showPassword} /></button>} />
      <InputGroup label="Xác nhận mật khẩu" type={showConfirm?'text':'password'} value={confirmPassword}
        onChange={setConfirmPassword} error={fieldErrors.confirmPassword} placeholder="Nhập lại mật khẩu"
        rightAction={<button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm(v=>!v)}><EyeIcon show={showConfirm} /></button>} />
      <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading||!!success}>
        {loading ? 'Đang xử lý...' : 'Đăng ký'}
      </button>
    </form>
  )
}

export default function Login() {
  const { user } = useAuth()
  const [tab, setTab] = useState('login')
  if (user) return <Navigate to="/" replace />

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={`t-tagline ${styles.shopName}`}>ShopVN.</span>
          <p className={`t-body ${styles.tagline}`}>Mua sắm thả ga. Giá cả phải chăng.</p>
        </div>
        <div className={styles.tabs}>
          <button className={`${styles.tabBtn} ${tab==='login'?styles.active:''} t-button-utility`} onClick={() => setTab('login')}>Đăng nhập</button>
          <button className={`${styles.tabBtn} ${tab==='register'?styles.active:''} t-button-utility`} onClick={() => setTab('register')}>Đăng ký</button>
        </div>
        <div className={styles.panel}>
          {tab === 'login' ? <LoginForm /> : <RegisterForm onSuccess={() => setTab('login')} />}
        </div>
      </div>
    </div>
  )
}
