import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.col}>
          <h4 className="t-caption-strong">ShopVN</h4>
          <p className="t-caption">Nền tảng mua sắm trực tuyến uy tín hàng đầu Việt Nam.</p>
        </div>
        <div className={styles.col}>
          <h4 className="t-caption-strong">Hỗ trợ</h4>
          <ul>
            <li><Link className="t-dense-link" to="#">Trung tâm trợ giúp</Link></li>
            <li><Link className="t-dense-link" to="#">Theo dõi đơn hàng</Link></li>
            <li><Link className="t-dense-link" to="#">Chính sách đổi trả</Link></li>
          </ul>
        </div>
        <div className={styles.col}>
          <h4 className="t-caption-strong">Về ShopVN</h4>
          <ul>
            <li><Link className="t-dense-link" to="#">Giới thiệu</Link></li>
            <li><Link className="t-dense-link" to="#">Tuyển dụng</Link></li>
            <li><Link className="t-dense-link" to="#">Chính sách bảo mật</Link></li>
          </ul>
        </div>
        <div className={styles.col}>
          <h4 className="t-caption-strong">Mua sắm</h4>
          <ul>
            <li><Link className="t-dense-link" to="/products">Tất cả sản phẩm</Link></li>
            <li><Link className="t-dense-link" to="/products?sort=bestseller">Bán chạy</Link></li>
            <li><Link className="t-dense-link" to="/checkout">Giỏ hàng</Link></li>
          </ul>
        </div>
      </div>
      <div className={`${styles.bottom} t-fine-print`}>© 2026 ShopVN. All rights reserved.</div>
    </footer>
  )
}
