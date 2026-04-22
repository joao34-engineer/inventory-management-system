import { Card } from '@shared/ui'
import { TrashIcon } from '@shared/ui/Icon'
import type { Product } from '@entities/product'
import './ProductCard.css'

interface ProductCardProps {
  product: Product
  onDelete?: (id: string) => void
}

export const ProductCard = ({ product, onDelete }: ProductCardProps): React.JSX.Element => {
  const statusConfig = {
    'in-stock': { label: 'In Stock', className: 'status-in-stock' },
    'low-stock': { label: 'Low Stock', className: 'status-low-stock' },
    'out-of-stock': { label: 'Out of Stock', className: 'status-out-of-stock' },
  }

  const { label, className } = statusConfig[product.status]

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    onDelete?.(product.id)
  }

  return (
    <Card className='product-card'>
      <div className='product-card-top'>
        <span className='product-category'>{product.category}</span>
        <div className='product-card-actions'>
          <span className={`product-status ${className}`}>{label}</span>
          {onDelete && (
            <button
              type='button'
              className='product-delete-btn'
              onClick={handleDelete}
              aria-label='Delete product'
            >
              <TrashIcon />
            </button>
          )}
        </div>
      </div>

      <h3 className='product-name'>{product.name}</h3>
      <p className='product-description'>{product.description}</p>

      <div className='product-card-bottom'>
        <span className='product-price'>
           {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
        </span>
        <span className='product-stock'>{product.stock} un.</span>
      </div>
    </Card>
  )
}
