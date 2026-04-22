export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export type CategoryApiResponse = {
  status: 'success' | 'error';
  data: Category[];
  message?: string;
};
