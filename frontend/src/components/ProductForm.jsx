import {useEffect, useState} from 'react'
import {uploadImageToCloudinary} from '../api/cloudinary'
import {productAPI, categoryAPI, brandAPI} from '../api'
import styles from './ProductForm.module.css'

export default function ProductForm() {
    const [imageUrl, setImageUrl] = useState('')
    const [preview, setPreview] = useState('')
    const [uploading, setUploading] = useState(false)
    const [form, setForm] = useState({ name:'', price:'', description:'', categoryId:'' })
    const [categories, setCategories] = useState([])
    const [brands, setBrands] = useState([])
    const [selectedBrand, setSelectedBrand] = useState('')
    const [customBrand, setCustomBrand] = useState('')

    useEffect(() => {
        categoryAPI.getAll().then(setCategories)
        brandAPI.getAll().then(setBrands)
    }, [])

    useEffect(() => {
        console.log('cloud_name:', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME)
        console.log('preset:', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)
    }, [])

    const handleImageChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        setPreview(URL.createObjectURL(file))
        try {
            setUploading(true)
            const url = await uploadImageToCloudinary(file)
            setImageUrl(url)
        } catch (err) { console.error(err); alert('Upload ảnh thất bại, thử lại') }
        finally { setUploading(false) }
    }

    const handleSubmit = async () => {
        if (!imageUrl) return alert('Vui lòng chờ ảnh upload xong')
        const finalBrand = selectedBrand === '__others__' ? customBrand : selectedBrand
        await productAPI.createProduct({
            ...form, price: parseInt(form.price),
            categoryId: parseInt(form.categoryId),
            brandName: finalBrand, image: imageUrl
        })
        alert('Đăng sản phẩm thành công!')
    }

    return (
        <div className={styles.card}>
            <label className={`${styles.dropArea} ${preview ? styles.hasPreview : ''}`}>
                <input type="file" accept="image/*" onChange={handleImageChange} className={styles.fileInput} />
                {preview ? (
                    <img src={preview} alt="preview" className={`${styles.preview} product-shadow`} />
                ) : (
                    <div className={styles.dropContent}>
                        <span className="t-body-strong">Tải ảnh sản phẩm</span>
                        <span className="t-caption">PNG, JPG · tối đa 5 MB</span>
                    </div>
                )}
            </label>
            {uploading && <p className={`t-caption ${styles.uploadingNote}`}>Đang upload ảnh...</p>}

            <div className={styles.formGroup}>
                <label className="t-caption-strong">Tên sản phẩm</label>
                <input className="pill-input" placeholder="Tên sản phẩm" value={form.name} onChange={e => setForm({...form,name:e.target.value})} />
            </div>
            <div className={styles.formGroup}>
                <label className="t-caption-strong">Giá (VNĐ)</label>
                <input className="pill-input" type="number" placeholder="0" value={form.price} onChange={e => setForm({...form,price:e.target.value})} />
            </div>
            <div className={styles.formGroup}>
                <label className="t-caption-strong">Mô tả sản phẩm</label>
                <textarea className={styles.textarea} placeholder="Mô tả sản phẩm" rows="4" value={form.description} onChange={e => setForm({...form,description:e.target.value})} />
            </div>
            <div className={styles.formGroup}>
                <label className="t-caption-strong">Danh mục</label>
                <select className={styles.select} value={form.categoryId} onChange={e => setForm({...form,categoryId:e.target.value})}>
                    <option value="">-- Chọn danh mục --</option>
                    {categories.filter(c => c.parentId !== null).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            <div className={styles.formGroup}>
                <label className="t-caption-strong">Thương hiệu</label>
                <select className={styles.select} value={selectedBrand} onChange={e => { setSelectedBrand(e.target.value); setCustomBrand('') }}>
                    <option value="">-- Chọn thương hiệu --</option>
                    {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                    <option value="__others__">Khác...</option>
                </select>
            </div>
            {selectedBrand === '__others__' && (
                <div className={styles.formGroup}>
                    <label className="t-caption-strong">Tên thương hiệu</label>
                    <input className="pill-input" placeholder="Nhập tên thương hiệu" value={customBrand} onChange={e => setCustomBrand(e.target.value)} />
                </div>
            )}
            <button onClick={handleSubmit} disabled={uploading} className={`btn-primary ${styles.submitBtn}`}>
                {uploading ? 'Đang xử lý...' : 'Đăng sản phẩm'}
            </button>
        </div>
    )
}
