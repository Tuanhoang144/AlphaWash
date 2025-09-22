// import { OrderResponseDTO } from "@/types/OrderResponse";


// const calculateDiscountFromOrder = (order: OrderResponseDTO): number => {
//   const serviceTotalBeforeTaxAndDiscount =
//     order.orderDetails?.reduce(
//       (sum, detail) =>
//         sum +
//         detail.service.reduce(
//           (serviceSum, service) =>
//             serviceSum + (service.serviceCatalog?.price || 0),
//           0
//         ),
//       0
//     ) || 0;

//   // Tính số tiền giảm giá
//   let discountAmount = order.discount || 0;
//   if (discountAmount < 100) {
//     discountAmount = Math.round((serviceTotalBeforeTaxAndDiscount * discountAmount) / 100);
//   }

//   return discountAmount;
// };

// const calculateVatFromOrder = (order: OrderResponseDTO): number => {
//   const serviceTotalBeforeTaxAndDiscount =
//     order.orderDetails?.reduce(
//       (sum, detail) =>
//         sum +
//         detail.service.reduce(
//           (serviceSum, service) =>
//             serviceSum + (service.serviceCatalog?.price || 0),
//           0
//         ),
//       0
//     ) || 0;

//   // Tính số tiền giảm giá
//   let discountAmount = order.discount;
//   if (order.discount < 100) {
//     discountAmount =
//       (serviceTotalBeforeTaxAndDiscount * (order.discount || 0)) / 100;
//   }

//   // Số tiền sau khi trừ giảm giá
//   const amountAfterDiscount = serviceTotalBeforeTaxAndDiscount - discountAmount;

//   // Tính VAT trên số tiền đã trừ giảm giá
//   return Math.round((amountAfterDiscount * (order.vat || 0)) / 100);
// };

// const calculateTotal = (order: OrderResponseDTO) => {
//   const serviceTotalBeforeTaxAndDiscount =
//     order.orderDetails?.reduce(
//       (sum, detail) =>
//         sum +
//         detail.service.reduce(
//           (serviceSum, service) =>
//             serviceSum + (service.serviceCatalog?.price || 0),
//           0
//         ),
//       0
//     ) || 0;

//   // Tính số tiền giảm giá
//   let discountAmount = order.discount;
//   if (order.discount < 100) {
//     discountAmount =
//       (serviceTotalBeforeTaxAndDiscount * (order.discount || 0)) / 100;
//   }

//   // Số tiền sau khi trừ giảm giá
//   const amountAfterDiscount = serviceTotalBeforeTaxAndDiscount - discountAmount;

//   // Tính VAT trên số tiền đã trừ giảm giá
//   const vatAmount = Math.round((amountAfterDiscount * (order.vat || 0)) / 100);

//   return Math.round(amountAfterDiscount + vatAmount);
// };

// const calculateBaseServicePrice = (order: OrderResponseDTO) => {
//   if (!order?.orderDetails) return 0;
//   return order.orderDetails.reduce(
//     (sum, detail) =>
//       sum +
//       detail.service.reduce(
//         (serviceSum, service) =>
//           serviceSum + (service.serviceCatalog?.price || 0),
//         0
//       ),
//     0
//   );
// };

// export { calculateTotal, calculateBaseServicePrice, calculateVatFromOrder, calculateDiscountFromOrder };


import type { OrderResponseDTO } from "@/types/OrderResponse"

const calculateDiscountFromOrder = (order: OrderResponseDTO): number => {
  const serviceTotalBeforeTaxAndDiscount =
    order.orderDetails?.reduce(
      (sum, detail) =>
        sum +
        detail.service.reduce((serviceSum, service) => {
          const price =
            service.serviceCatalog?.isException && service.serviceCatalog?.exceptionPrice
              ? service.serviceCatalog.exceptionPrice
              : service.serviceCatalog?.price || 0
          return serviceSum + price
        }, 0),
      0,
    ) || 0

  // Tính số tiền giảm giá
  let discountAmount = order.discount || 0
  if (discountAmount < 100) {
    discountAmount = Math.round((serviceTotalBeforeTaxAndDiscount * discountAmount) / 100)
  }

  return discountAmount
}

const calculateVatFromOrder = (order: OrderResponseDTO): number => {
  const serviceTotalBeforeTaxAndDiscount =
    order.orderDetails?.reduce(
      (sum, detail) =>
        sum +
        detail.service.reduce((serviceSum, service) => {
          const price =
            service.serviceCatalog?.isException && service.serviceCatalog?.exceptionPrice
              ? service.serviceCatalog.exceptionPrice
              : service.serviceCatalog?.price || 0
          return serviceSum + price
        }, 0),
      0,
    ) || 0

  // Tính số tiền giảm giá
  let discountAmount = order.discount || 0
  if (order.discount && order.discount < 100) {
    discountAmount = (serviceTotalBeforeTaxAndDiscount * (order.discount || 0)) / 100
  }

  // Số tiền sau khi trừ giảm giá
  const amountAfterDiscount = serviceTotalBeforeTaxAndDiscount - discountAmount

  // Tính VAT trên số tiền đã trừ giảm giá
  return Math.round((amountAfterDiscount * (order.vat || 0)) / 100)
}

const calculateTotal = (order: OrderResponseDTO) => {
  const serviceTotalBeforeTaxAndDiscount =
    order.orderDetails?.reduce(
      (sum, detail) =>
        sum +
        detail.service.reduce((serviceSum, service) => {
          const price =
            service.serviceCatalog?.isException && service.serviceCatalog?.exceptionPrice
              ? service.serviceCatalog.exceptionPrice
              : service.serviceCatalog?.price || 0
          return serviceSum + price
        }, 0),
      0,
    ) || 0

  // Tính số tiền giảm giá
  let discountAmount = order.discount || 0
  if (order.discount && order.discount < 100) {
    discountAmount = (serviceTotalBeforeTaxAndDiscount * (order.discount || 0)) / 100
  }

  // Số tiền sau khi trừ giảm giá
  const amountAfterDiscount = serviceTotalBeforeTaxAndDiscount - discountAmount

  // Tính VAT trên số tiền đã trừ giảm giá
  const vatAmount = Math.round((amountAfterDiscount * (order.vat || 0)) / 100)

  return Math.round(amountAfterDiscount + vatAmount)
}

const calculateBaseServicePrice = (order: OrderResponseDTO) => {
  if (!order?.orderDetails) return 0
  return order.orderDetails.reduce(
    (sum, detail) =>
      sum +
      detail.service.reduce((serviceSum, service) => {
        const price =
          service.serviceCatalog?.isException && service.serviceCatalog?.exceptionPrice
            ? service.serviceCatalog.exceptionPrice
            : service.serviceCatalog?.price || 0
        return serviceSum + price
      }, 0),
    0,
  )
}

export { calculateTotal, calculateBaseServicePrice, calculateVatFromOrder, calculateDiscountFromOrder }
