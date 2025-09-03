import { OrderResponseDTO } from "@/types/OrderResponse";

const calculateTotal = (order: OrderResponseDTO) => {
  const serviceTotalBeforeTaxAndDiscount =
    order.orderDetails?.reduce(
      (sum, detail) =>
        sum +
        detail.service.reduce(
          (serviceSum, service) =>
            serviceSum + (service.serviceCatalog?.price || 0),
          0
        ),
      0
    ) || 0;
  const vatAmount = (serviceTotalBeforeTaxAndDiscount * (order.vat || 0)) / 100;
  let discountAmount = order.discount;
  if (order.discount < 100) {
    discountAmount = 
      (serviceTotalBeforeTaxAndDiscount * (order.discount || 0)) / 100;
  }
  return Math.round(
    serviceTotalBeforeTaxAndDiscount + vatAmount - discountAmount
  );
};


export default calculateTotal;