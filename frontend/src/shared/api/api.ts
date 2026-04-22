const BASE_URL = "http://localhost:3000/api";

export async function apiFetch<T> (
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {

  const token = localStorage.getItem('auth_token')

  const headers =  {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}`}),
    ...options.headers
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Something went wrong')
  }

  return response.json()
}