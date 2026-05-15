import { useState } from 'react'
import { uploadImageToCloudinary } from '../api/cloudinary'
import { productAPI } from '../api'

export default function ProductForm() {
    const [imageFile, setImageFile]   = useState(null)
    const [imageUrl, setImageUrl]     = useState('')
    const [preview, setPreview]       = useState('')
    const [uploading, setUploading]   = useState(false)
    const [form, setForm]             = useState({
        name: '', price: '', description: '', categoryId: '', brandId: ''
    })

    // Chọn file → preview ngay, upload lên Cloudinary
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
            alert('Upload ảnh thất bại, thử lại')
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async () => {
        if (!imageUrl) return alert('Vui lòng chờ ảnh upload xong')

        await productAPI.createProduct({ ...form, image: imageUrl })
        alert('Đăng sản phẩm thành công!')
    }

    return (
        <div>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {preview && <img src={preview} width={120} alt="preview" />}
            {uploading && <p>Đang upload ảnh...</p>}

            <input placeholder="Tên sản phẩm"
                   value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            {/* các field còn lại tương tự */}

            <button onClick={handleSubmit} disabled={uploading}>
                {uploading ? 'Đang xử lý...' : 'Đăng sản phẩm'}
            </button>
        </div>
    )
}