"use client";

import { useState, useCallback } from "react";
import { CarSize } from "@/types/CarSize";

const dummyData: CarSize[] = [
  {
    id: 1,
    brandCode: "BMW",
    modelCode: "X5",
    brandName: "BMW",
    modelName: "X5 2024",
    size: "SUV",
    note: "Xe sang",
  },
  {
    id: 2,
    brandCode: "TOY",
    modelCode: "C01",
    brandName: "Toyota",
    modelName: "Corolla",
    size: "Sedan",
    note: "Phổ biến",
  },
];

export function useCarSizeManager() {
  const [carSizes, setCarSizes] = useState<CarSize[]>(dummyData);
  const [loading, setLoading] = useState(false);

  const getAllCarSizes = useCallback(async () => {
    setLoading(true);
    try {
      return carSizes;
    } finally {
      setLoading(false);
    }
  }, [carSizes]);

  const addCarSize = async (newData: Omit<CarSize, "id" | "brandCode" | "brandName" | "modelName">) => {
    const newId = carSizes.length ? Math.max(...carSizes.map(c => c.id)) + 1 : 1;
    const newCarSize: CarSize = {
      id: newId,
      brandCode: "DUMMY",
      brandName: "DummyBrand",
      modelName: "DummyModel",
      ...newData,
    };
    setCarSizes(prev => [...prev, newCarSize]);
  };

  const updateCarSize = async (id: number, updated: Omit<CarSize, "id" | "brandCode" | "brandName" | "modelName">) => {
    setCarSizes(prev =>
      prev.map(c =>
        c.id === id
          ? { ...c, ...updated }
          : c
      )
    );
  };

  const deleteCarSize = async (id: number) => {
    setCarSizes(prev => prev.filter(c => c.id !== id));
  };

  return {
    carSizes,
    loading,
    getAllCarSizes,
    addCarSize,
    updateCarSize,
    deleteCarSize,
  };
}