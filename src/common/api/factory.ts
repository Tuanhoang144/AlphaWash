import API from './axios';

export interface CrudApi<T> {
  getAll(): Promise<T[]>;
  getById(id: number | string): Promise<T>;
  create(data: Partial<T>): Promise<T>;
  update(id: number | string, data: Partial<T>): Promise<T>;
  delete(id: number | string): Promise<void>;
}

export const createApi = <T>(basePath: string): CrudApi<T> => ({
  getAll: async () => {
    const res = await API.get<T[]>(basePath);
    return res.data;
  },
  getById: async (id) => {
    const res = await API.get<T>(`${basePath}/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await API.post<T>(basePath, data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await API.put<T>(`${basePath}/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    await API.delete(`${basePath}/${id}`);
  },
});