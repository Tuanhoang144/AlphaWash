"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Car } from "@/types/CarUser";
import { CarTable } from "./components/table";
import { CarDetailDialog } from "./components/car-detail-diaglog";
import { useCarManager } from "@/services/userCarManager";
import { CarDialog } from "./components/CarDialog";

export default function CarsPage() {
    const { cars, getAllCars, addCar, updateCar, deleteCar } = useCarManager();
    const [search, setSearch] = useState("");
    const [filteredCars, setFilteredCars] = useState<Car[]>([]);
    const [selectedCar, setSelectedCar] = useState<Car | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);

    const handleViewDetail = (car: Car) => {
        setSelectedCar(car);
        setOpenDetail(true);
    };

    useEffect(() => {
        getAllCars().then((data) => setFilteredCars(data));
    }, [cars, getAllCars]);

    useEffect(() => {
        setFilteredCars(
            cars.filter(
                (c) =>
                    c.licensePlate.toLowerCase().includes(search.toLowerCase()) ||
                    c.customerName.toLowerCase().includes(search.toLowerCase())
            )
        );
    }, [search, cars]);

    const handleShowDetail = (car: Car) => {
        setSelectedCar(car);
        setDetailOpen(true);
    };

    return (
        <div className="space-y-4">
            {/* Thanh tìm kiếm + nút thêm */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 w-1/2">
                    <Input
                        placeholder="Tìm theo biển số hoặc tên khách..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full"
                    />
                </div>
                <Button onClick={() => alert("TODO: mở form thêm xe")}>Thêm xe</Button>
            </div>

            <CarTable
                cars={filteredCars}
                onEdit={(c) => alert("TODO: mở form sửa xe " + c.id)}
                onDelete={deleteCar}
                onViewDetail={handleViewDetail}
            />
            <CarDialog
                car={selectedCar}
                open={openDetail}
                onClose={() => setOpenDetail(false)}
            />
            <CarDetailDialog
                car={selectedCar}
                open={detailOpen}
                onClose={() => setDetailOpen(false)}
            />
        </div>
    );
}