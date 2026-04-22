export interface DataBaseError extends Error {
  code: string
  detail?: string
  table?: string
}


