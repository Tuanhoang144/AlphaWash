import { createApi } from '../factory';
import { Product } from '../../../type/product';

export const productApi = createApi<Product>('/products');