import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.name}>ShopVN</span>
          <p>Nền tảng mua sắm trực tuyến uy tín hàng đầu Việt Nam.</p>
        </div>
        <div className={styles.col}>
          <h4>Hỗ trợ</h4>
          <ul>
            <li><Link to="#">Trung tâm trợ giúp</Link></li>
            <li><Link to="#">Theo dõi đơn hàng</Link></li>
            <li><Link to="#">Chính sách đổi trả</Link></li>
          </ul>
        </div>
        <div className={styles.col}>
          <h4>Về ShopVN</h4>
          <ul>
            <li><Link to="#">Giới thiệu</Link></li>
            <li><Link to="#">Tuyển dụng</Link></li>
            <li><Link to="#">Chính sách bảo mật</Link></li>
          </ul>
        </div>
      </div>
      <div className={styles.bottom}>© 2026 ShopVN. All rights reserved.</div>
    </footer>
  )
}
