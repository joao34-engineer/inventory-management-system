export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  status: 'in-stock' | 'low-stock' | 'out-of-stock'
}
