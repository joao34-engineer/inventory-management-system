import { useEffect, useRef } from 'react'
import type { Product } from '@entities/product'
import './StockChart.css'

interface StockChartProps {
  products: Product[]
}

const ChartBar = ({ product, heightPercent }: { product: Product, heightPercent: number }) => {
  const barRef = useRef<HTMLDivElement>(null)

  const getBarColor = (p: Product): string => {
    if (p.status === 'out-of-stock') return '#f87171'
    if (p.status === 'low-stock') return '#facc15'
    return '#4ade80'
  }

  useEffect(() => {
    if (barRef.current) {
      barRef.current.style.setProperty('--bar-height', `${heightPercent}%`)
      barRef.current.style.setProperty('--bar-color', getBarColor(product))
    }
  }, [heightPercent, product])

  return <div ref={barRef} className='chart-bar-fill' />
}

export const StockChart = ({ products }: StockChartProps): React.JSX.Element => {
  const maxStock = Math.max(...products.map(p => p.stock))

  // Shorten long product names for chart labels
  const getShortName = (name: string): string => {
    if (name.length > 18) return name.substring(0, 16) + '…'
    return name
  }

  return (
    <div className='stock-chart'>
      <div className='chart-bars'>
        {products.map(product => {
          const heightPercent = maxStock > 0 ? (product.stock / maxStock) * 100 : 0

          return (
            <div key={product.id} className='chart-column'>
              <span className='chart-value'>{product.stock}</span>
              <div className='chart-bar-track'>
                <ChartBar product={product} heightPercent={heightPercent} />
              </div>
              <span className='chart-label'>{getShortName(product.name)}</span>
            </div>
          )
        })}
      </div>

      <div className='chart-legend'>
        <div className='legend-item'>
          <span className='legend-dot dot-in-stock' />
          <span>In Stock</span>
        </div>
        <div className='legend-item'>
          <span className='legend-dot dot-low-stock' />
          <span>Low Stock</span>
        </div>
        <div className='legend-item'>
          <span className='legend-dot dot-out-of-stock' />
          <span>Out of Stock</span>
        </div>
      </div>
    </div>
  )
}

