import { apiFetch } from '@shared/api/api.ts'
import type { Category } from '@entities/category/model/types'

interface CreateCategoryInput {
  name: string
}

interface CreateCategorySuccessResponse {
  status: 'success'
  data: Category
}

interface CreateCategoryErrorResponse {
  status: 'error'
  message?: string
  errors?: Array<{ field: string; message: string }>
}

type CreateCategoryResponse = CreateCategorySuccessResponse | CreateCategoryErrorResponse

export const createCategory = async (input: CreateCategoryInput): Promise<Category> => {
  const response = await apiFetch<CreateCategoryResponse>('/categories', {
    method: 'POST',
    body: JSON.stringify(input)
  })

  if (response.status === 'error') {
    if (response.errors && response.errors.length > 0) {
      throw new Error(response.errors[0].message)
    }
    throw new Error(response.message || 'Failed to create category')
  }

  return response.data
}
