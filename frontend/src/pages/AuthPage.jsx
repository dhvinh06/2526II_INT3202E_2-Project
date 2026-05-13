import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import styles from './AuthPage.module.css'

const EyeIcon = ({ open }) => open
  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Alert({ type, msg }) {
  if (!msg) return null
  return <div className={`${styles.alert} ${styles[type]}`}>{msg}</div>
}

function InputField({ label, id, type = 'text', value, onChange, error, placeholder, rightEl }) {
  return (
    <div className={styles.formGroup}>
      <label htmlFor={id}>{label}</label>
      <div className={styles.inputWrap}>
        <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} className={error ? styles.invalid : ''} autoComplete="off" />
        {rightEl}
      </div>
      {error && <span className={styles.errMsg}>{error}</span>}
    </div>
  )
}

/* ── LOGIN ── */
function LoginTab({ onSuccess }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState({})
  const [alert, setAlert] = useState(null)
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!emailRe.test(email)) e.email = 'Email không hợp lệ.'
    if (pass.length < 6) e.pass = 'Mật khẩu ít nhất 6 ký tự.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (ev) => {
    ev.preventDefault()
    setAlert(null)
    if (!validate()) return
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password: pass })
      localStorage.setItem('user', JSON.stringify({ id: data.id, name: data.name, role: data.role, email: data.email }))
      navigate('/')
    } catch (err) {
      if (err.response?.status === 401) setAlert({ type: 'error', msg: '⚠ Sai email hoặc mật khẩu.' })
      else setAlert({ type: 'error', msg: '⚠ Đã xảy ra lỗi. Vui lòng thử lại.' })
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} noValidate>
      <Alert {...(alert || {})} />
      <InputField label="Email" id="l-email" type="email" value={email} onChange={setEmail}
        error={errors.email} placeholder="example@email.com" />
      <InputField label="Mật khẩu" id="l-pass" type={showPass ? 'text' : 'password'}
        value={pass} onChange={setPass} error={errors.pass} placeholder="Ít nhất 6 ký tự"
        rightEl={
          <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(v => !v)}>
            <EyeIcon open={showPass} />
          </button>
        } />
      <button type="submit" className={styles.btnSubmit} disabled={loading}>
        {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
      </button>
    </form>
  )
}

/* ── REGISTER ── */
function RegisterTab({ onSuccess }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState({})
  const [alert, setAlert] = useState(null)
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!name.trim()) e.name = 'Vui lòng nhập họ tên.'
    if (!emailRe.test(email)) e.email = 'Email không hợp lệ.'
    if (pass.length < 6) e.pass = 'Mật khẩu ít nhất 6 ký tự.'
    if (confirm !== pass) e.confirm = 'Mật khẩu xác nhận không khớp.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (ev) => {
    ev.preventDefault()
    setAlert(null)
    if (!validate()) return
    setLoading(true)
    try {
      await api.post('/auth/register', { name, email, password: pass })
      onSuccess('✓ Đăng ký thành công! Vui lòng đăng nhập.')
    } catch (err) {
      if (err.response?.status === 409) setAlert({ type: 'error', msg: '⚠ Email này đã được sử dụng.' })
      else setAlert({ type: 'error', msg: '⚠ Đã xảy ra lỗi. Vui lòng thử lại.' })
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} noValidate>
      <Alert {...(alert || {})} />
      <InputField label="Họ và tên" id="r-name" value={name} onChange={setName}
        error={errors.name} placeholder="Nguyễn Văn A" />
      <InputField label="Email" id="r-email" type="email" value={email} onChange={setEmail}
        error={errors.email} placeholder="example@email.com" />
      <InputField label="Mật khẩu" id="r-pass" type={showPass ? 'text' : 'password'}
        value={pass} onChange={setPass} error={errors.pass} placeholder="Ít nhất 6 ký tự"
        rightEl={<button type="button" className={styles.eyeBtn} onClick={() => setShowPass(v => !v)}><EyeIcon open={showPass} /></button>} />
      <InputField label="Xác nhận mật khẩu" id="r-confirm" type={showConfirm ? 'text' : 'password'}
        value={confirm} onChange={setConfirm} error={errors.confirm} placeholder="Nhập lại mật khẩu"
        rightEl={<button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm(v => !v)}><EyeIcon open={showConfirm} /></button>} />
      <button type="submit" className={styles.btnSubmit} disabled={loading}>
        {loading ? 'Đang xử lý…' : 'Đăng ký'}
      </button>
    </form>
  )
}

/* ── MAIN PAGE ── */
export default function AuthPage() {
  const [tab, setTab] = useState('login')
  const [successMsg, setSuccessMsg] = useState('')

  const handleRegisterSuccess = (msg) => {
    setSuccessMsg(msg)
    setTab('login')
  }

  return (
    <div className={styles.page}>
      <div className={styles.wrapper}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 24 24" fill="white" width="28" height="28">
              <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59L5.25 14c-.16.28-.25.61-.25.96C5 16.1 5.9 17 7 17h14v-2H7.42a.25.25 0 0 1-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 23.46 4H5.21l-.94-2H1z"/>
            </svg>
          </div>
          <span className={styles.logoName}>ShopVN</span>
          <span className={styles.logoSub}>Mua sắm thả ga – Giá cả phải chăng</span>
        </div>

        {/* Card */}
        <div className={styles.card}>
          <div className={styles.tabs}>
            <button className={`${styles.tabBtn} ${tab === 'login' ? styles.active : ''}`} onClick={() => { setTab('login'); setSuccessMsg('') }}>Đăng nhập</button>
            <button className={`${styles.tabBtn} ${tab === 'register' ? styles.active : ''}`} onClick={() => { setTab('register'); setSuccessMsg('') }}>Đăng ký</button>
          </div>

          <div className={styles.panel}>
            {successMsg && <div className={`${styles.alert} ${styles.success}`}>{successMsg}</div>}
            {tab === 'login'
              ? <LoginTab />
              : <RegisterTab onSuccess={handleRegisterSuccess} />
            }
          </div>

          <div className={styles.switchRow}>
            {tab === 'login'
              ? <><span>Chưa có tài khoản? </span><button className={styles.switchLink} onClick={() => setTab('register')}>Đăng ký ngay</button></>
              : <><span>Đã có tài khoản? </span><button className={styles.switchLink} onClick={() => setTab('login')}>Đăng nhập</button></>
            }
          </div>
        </div>
      </div>
    </div>
  )
}
