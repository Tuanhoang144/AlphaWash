import { Customer } from "./Customer";

export type Order = {
  id: string; 
  customer?: Customer;
  date?: string;
  checkinTime?: string; 
  checkoutTime?: string;
  paymentStatus?: string;
  vat?: number;
  discount?: number;
  note?: string;
  totalPrice?: number;
};
