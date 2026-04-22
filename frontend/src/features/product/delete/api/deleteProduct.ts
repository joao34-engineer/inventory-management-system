import { apiFetch } from '@shared/api/api'

export const deleteProduct = async (id: string): Promise<void> => {
  await apiFetch(`/products/${id}`, {
    method: 'DELETE'
  })
}
