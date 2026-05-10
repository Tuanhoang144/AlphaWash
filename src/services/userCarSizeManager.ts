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

const API_URL = "http://localhost:8080/api/vehicle/size";

export function useCarSizeManager() {
  const [carSizes, setCarSizes] = useState<CarSize[]>(dummyData);
  const [loading, setLoading] = useState(false);

  const getAllCarSizes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, { method: "GET" });
      if (!res.ok) throw new Error("Failed to fetch car sizes");
      const response  = await res.json();
      console.log(response);
      setCarSizes(response.data);
      return response.data;
    } catch (error) {
      console.error(error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

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

  const updateCarSize = async ( updated: Omit<CarSize, "id" | "brandCode" | "brandName" | "modelName">) => {
    setLoading(true);
  try {
    const res = await fetch(`${API_URL}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    if (!res.ok) throw new Error("Failed to update car size");
    const updatedData: CarSize = await res.json();

    setCarSizes(prev =>
      prev.map(c => (c.id === updatedData.id ? { ...c, ...updatedData } : c))
    );

    return updatedData;
  } finally {
    setLoading(false);
  }
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