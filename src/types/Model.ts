import { Brand } from './Brand';

export type Model = {
  id: number;
  code: string;
  modelName: string;
  size: string;
  brand?: Brand;
}
