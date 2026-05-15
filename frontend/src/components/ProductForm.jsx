import {useEffect, useState} from 'react'
import {uploadImageToCloudinary} from '../api/cloudinary'
import {productAPI, categoryAPI, brandAPI} from '../api'


export default function ProductForm() {
    const [imageFile, setImageFile] = useState(null)
    const [imageUrl, setImageUrl] = useState('')
    const [preview, setPreview] = useState('')
    const [uploading, setUploading] = useState(false)
    const [form, setForm] = useState({
        name: '', price: '', description: '', categoryId: ''
    })
    const [categories, setCategories] = useState([])
    const [brands, setBrands] = useState([])
    const [selectedBrand, setSelectedBrand] = useState('')
    const [customBrand, setCustomBrand] = useState('')
    useEffect(() => {
        categoryAPI.getAll().then(setCategories)
        brandAPI.getAll().then(setBrands)
    }, [])

    const handleImageChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        setImageFile(file)
        setPreview(URL.createObjectURL(file))  // preview local ngay lập tức

        try {
            setUploading(true)
            const url = await uploadImageToCloudinary(file)
            setImageUrl(url)  // lưu URL thật vào state
        } catch (err) {
            console.error(err)
            alert('Upload ảnh thất bại, thử lại')
        } finally {
            setUploading(false)
        }
    }
    useEffect(() => {
        console.log('cloud_name:', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME)
        console.log('preset:', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)
    }, [])

    const handleSubmit = async () => {
        if (!imageUrl) return alert('Vui lòng chờ ảnh upload xong')
        const finalBrand = selectedBrand === '__others__' ? customBrand : selectedBrand
        await productAPI.createProduct({
            ...form, price: parseInt(form.price),
            categoryId: parseInt(form.categoryId),
            brandName: finalBrand,
            image: imageUrl
        })
        alert('Đăng sản phẩm thành công!')
    }


    return (
        <div>
            <input type="file" accept="image/*" onChange={handleImageChange}/>
            {preview && <img src={preview} width={120} alt="preview"/>}
            {uploading && <p>Đang upload ảnh...</p>}

            <input placeholder="Tên sản phẩm"
                   value={form.name} onChange={e => setForm({...form, name: e.target.value})}/>
            <input type="number" placeholder="Giá (VNĐ)"
                   value={form.price} onChange={e => setForm({...form, price: e.target.value})}/>

            <textarea placeholder="Mô tả sản phẩm"
                      value={form.description} onChange={e => setForm({...form, description: e.target.value})}/>

            <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}>
                <option value="">-- Chọn danh mục --</option>
                {categories.filter(c => c.parentId !== null).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>

            <select value={selectedBrand} onChange={e => {
                setSelectedBrand(e.target.value)
                setCustomBrand('')
            }}>
                <option value="">-- Chọn thương hiệu --</option>
                {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                <option value="__others__">Khác...</option>
            </select>

            {selectedBrand === '__others__' && (
                <input placeholder="Nhập tên thương hiệu"
                       value={customBrand} onChange={e => setCustomBrand(e.target.value)}/>
            )}

            <button onClick={handleSubmit} disabled={uploading}>
                {uploading ? 'Đang xử lý...' : 'Đăng sản phẩm'}
            </button>
        </div>
    )
}