// types/CarSize.ts
export interface CarSize {
  id: number;
  brandCode: string;
  modelCode: string;
  brandName: string;
  modelName: string;
  size: string;
  note?: string;
}

export interface CreateCarSizeRequest {
  brandCode: string | null;
  brandName: string;
  modelName: string;
  size: string;
  note: string;
}

// form data chỉ dùng cho thêm/sửa
export type CarSizeFormData = Pick<CarSize, "modelCode" | "size" | "note">;