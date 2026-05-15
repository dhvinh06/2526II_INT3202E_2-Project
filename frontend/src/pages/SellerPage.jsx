import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import ProductForm from '../components/ProductForm'

export default function SellerPage() {
    const { user } = useAuth()

    if (!user || user.role !== 'SELLER') return <Navigate to="/" />

    return (
        <div>
            <h2>Seller Dashboard</h2>
            <ProductForm />
        </div>
    )
}