export interface BasicInformationRequest {
  date: string;
  checkinTime: string;
  checkoutTime: string;
  paymentType: string;
  paymentStatus: string;
  tip: number;
  discount: number;
  status: string;
  vat: number;
  totalPrice: number;
  employeeId: string;
  note: string | null;
}

export interface BasicVehicleRequest {
    licensePlate: string;
    brandCode: string;
    modelCode: string;
    note: string | null;
}

export interface BasicServiceRequest {
    serviceTypeCode: string;
    serviceCode: string;
    serviceCatalogCode: string;
}

export interface BasicCustomerRequest {
    id?: string;
    name?: string;
    phone?: string;
}

export interface OrderDTO {
    information: BasicInformationRequest;
    vehicle: BasicVehicleRequest;
    service: BasicServiceRequest;
    customer?: BasicCustomerRequest | null;
}
