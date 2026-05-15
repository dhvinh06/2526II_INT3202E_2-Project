import { Link } from 'react-router-dom'
import styles from './ProductCard.module.css'

const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
const discount = (sale, orig) => orig > sale ? Math.round((1 - sale / orig) * 100) : 0
const stars = (r) => { const v = Math.round(Number(r)||0); return '★'.repeat(Math.max(0,Math.min(5,v)))+'☆'.repeat(Math.max(0,5-Math.max(0,Math.min(5,v)))) }

export default function ProductCard({ product }) {
  const { id, name, price, originalPrice, image, rating, sold } = product
  const disc = discount(price, originalPrice)
  return (
    <Link to={`/products/${id}`} className={styles.card}>
      <div className={styles.imgWrap}>
        <img className={`${styles.image} product-shadow`} src={image} alt={name} loading="lazy" />
      </div>
      <div className={styles.body}>
        <p className={`${styles.name} t-body-strong`}>{name}</p>
        <div className={styles.prices}>
          <span className={`${styles.sale} t-body`}>{fmt(price)}</span>
          {originalPrice > price && <span className={`${styles.orig} t-caption`}>{fmt(originalPrice)}</span>}
          {disc > 0 && <span className={`${styles.disc} t-caption`}>− {disc}%</span>}
        </div>
        <div className={`${styles.meta} t-caption`}>
          {rating != null && Number(rating) > 0 && (
            <span className={styles.rating}><span className={styles.stars}>{stars(rating)}</span><span>{Number(rating).toFixed(1)}</span></span>
          )}
          {sold !== undefined && <span className={styles.sold}>Đã bán {Number(sold).toLocaleString()}</span>}
        </div>
        <span className={`${styles.cta} text-link`}>Mua ngay ›</span>
      </div>
    </Link>
  )
}
