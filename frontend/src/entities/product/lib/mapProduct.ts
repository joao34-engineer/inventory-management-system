import type { Product } from '../model/types.ts'


export function mapProductFromApi(data: unknown): Product | null {
  if (typeof data !== 'object' || data === null) return null


  const raw = data as Record<string, unknown>

  
  const getString = (val: unknown, fallback = ''): string => 
    typeof val === 'string' ? val : fallback


  const getPrice = (val: unknown): number => {
    const num = Number(val)
    return isNaN(num) ? 0 : num / 100
  }

  // Helper to handle stock
  const getStock = (val: unknown): number => {
    const num = Number(val)
    return isNaN(num) ? 0 : num
  }

  // Safe mapping of status
  const getStatus = (val: unknown): Product['status'] => {
    const s = String(val)
    if (s === 'in-stock' || s === 'low-stock' || s === 'out-of-stock') {
      return s
    }
    return 'in-stock' // Default fallback
  }

  try {
    return {
      id: getString(raw.id),
      name: getString(raw.name),
      description: getString(raw.description),
      price: getPrice(raw.price),
      stock: getStock(raw.quantity), // Mapping 'quantity' from backend
      category: getString(raw.categoryName, 'Sem Categoria'), // Mapping joined categoryName
      status: getStatus(raw.status)
    }
  } catch (err) {
    console.error('Extraction error in mapProductFromApi:', err)
    return null
  }
}
