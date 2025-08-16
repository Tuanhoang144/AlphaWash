"use client";

import { useState, useCallback } from "react";
import { Car } from "@/types/CarUser";

const dummyData: Car[] = [
  {
    id: 1,
    licensePlate: "51A-12345",
    vehicleName: "BMW X5",
    serviceUsage: "3",
    checkinTime: "2025-08-16T10:30:00",
    customerName: "Nguyễn Văn A",
    phone: "0909123456",
    note: "Khách VIP",
  },
  {
    id: 2,
    licensePlate: "30F-88888",
    vehicleName: "Toyota Corolla",
    serviceUsage: "1",
    checkinTime: "2025-08-15T09:00:00",
    customerName: "Trần Thị B",
    phone: "0912345678",
    note: "",
  },
];

export function useCarManager() {
  const [cars, setCars] = useState<Car[]>(dummyData);
  const [loading, setLoading] = useState(false);

  const getAllCars = useCallback(async () => {
    setLoading(true);
    try {
      return cars;
    } finally {
      setLoading(false);
    }
  }, [cars]);

  const addCar = async (newData: Omit<Car, "id">) => {
    const newId = cars.length ? Math.max(...cars.map(c => c.id)) + 1 : 1;
    setCars(prev => [...prev, { id: newId, ...newData }]);
  };

  const updateCar = async (id: number, updated: Omit<Car, "id">) => {
    setCars(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updated } : c))
    );
  };

  const deleteCar = async (id: number) => {
    setCars(prev => prev.filter(c => c.id !== id));
  };

  return {
    cars,
    loading,
    getAllCars,
    addCar,
    updateCar,
    deleteCar,
  };
}