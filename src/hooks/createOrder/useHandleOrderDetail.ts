"use client";

import { useEmployeeManager } from "@/services/useEmployeeManager";
import { EmployeeDTO } from "@/types/employee/EmployeeDTO";
import { OrderDetailDTO } from "@/types/order/OrderDetailDTO";
import { useEffect, useMemo, useState } from "react";

export function useHandleOrderDetail(
  orderDetails: OrderDetailDTO[],
  handleOrderDetailChange?: (details: OrderDetailDTO[]) => void
) {
  const [open, setOpen] = useState(false);
  const [listEmployees, setListEmployees] = useState<EmployeeDTO[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<EmployeeDTO[]>([]);
  const { getAllEmployees } = useEmployeeManager();

  useEffect(() => {
    (async () => {
      try {
        setListEmployees(await getAllEmployees());
      } catch (e) {
        console.error("[EmployeeSelector] Error loading employees:", e);
      }
    })();
  }, [getAllEmployees]);

  const onHandleEmployeeChange = (index: number, employees: EmployeeDTO[]) => {
    setSelectedEmployees(employees);
    const updatedDetails = orderDetails.map((detail, i) =>
      i === index ? { ...detail, employees: employees } : detail
    );
    handleOrderDetailChange?.(updatedDetails);
  };

  const addOrderDetail = (newDetail: OrderDetailDTO) => {
    const updatedDetails = [...orderDetails, newDetail];
    handleOrderDetailChange?.(updatedDetails);
  };

  const updateOrderDetail = (index: number, updatedDetail: OrderDetailDTO) => {
    const updatedDetails = orderDetails.map((detail, i) =>
      i === index ? updatedDetail : detail
    );
    handleOrderDetailChange?.(updatedDetails);
  };

  const removeOrderDetail = (index: number) => {
    const updatedDetails = orderDetails.filter((_, i) => i !== index);
    handleOrderDetailChange?.(updatedDetails);
  };

  return {
    addOrderDetail,
    updateOrderDetail,
    removeOrderDetail,
    open,
    setOpen,
    listEmployees,
    onHandleEmployeeChange,
    selectedEmployees,
  };
}
