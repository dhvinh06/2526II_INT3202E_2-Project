import { Link } from 'react-router-dom'
import styles from './ProductCard.module.css'

const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
const discount = (sale, orig) => orig > sale ? Math.round((1 - sale / orig) * 100) : 0
const stars = (r) => {
  const v = Math.round(Number(r) || 0)
  return '★'.repeat(Math.max(0, Math.min(5, v))) + '☆'.repeat(Math.max(0, 5 - Math.max(0, Math.min(5, v))))
}

export default function ProductCard({ product }) {
  const { id, name, price, originalPrice, image, rating, sold, category } = product
  const disc = discount(price, originalPrice)

  return (
    <Link to={`/products/${id}`} className={styles.card}>
      <div className={styles.imgWrap}>
        {disc > 0 && <span className={styles.badge}>-{disc}%</span>}
        <img src={image} alt={name} loading="lazy" />
        <div className={styles.quickView}>👁 Xem nhanh</div>
      </div>
      <div className={styles.body}>
        {category && <span className={styles.cat}>{category}</span>}
        <p className={styles.name}>{name}</p>
        <div className={styles.prices}>
          <span className={styles.sale}>{fmt(price)}</span>
          {originalPrice > price && <span className={styles.orig}>{fmt(originalPrice)}</span>}
        </div>
        <div className={styles.meta}>
          {rating != null && Number(rating) > 0 && (
            <span className={styles.stars} title={`${rating}/5`}>{stars(rating)} <b>{Number(rating).toFixed(1)}</b></span>
          )}
          {sold !== undefined && <span className={styles.sold}>Đã bán {Number(sold).toLocaleString()}</span>}
        </div>
      </div>
    </Link>
  )
}
