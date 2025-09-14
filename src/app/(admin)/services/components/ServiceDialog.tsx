"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ServiceAll, ServiceFormData, ServiceType } from "@/types/ServiceAll";
import { useServiceManager } from "@/services/useServiceAll";

interface Props {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    service?: ServiceAll | null;
    onSave: (service: {
        serviceCode: string;
        serviceName: string;
        price: number;
        duration: string;
        size: string;
        note?: string;
    }) => void;
}

export function ServiceDialog({ isOpen, onOpenChange, service, onSave }: Props) {
    const [form, setForm] = useState({
        serviceCode: "",
        serviceName: "",
        price: 0,
        duration: "",
        size: "",
        note: "",
        serviceTypeName: "",
        serviceTypeCode: "",
    });
    const { getAllServiceType, getAllServiceCode } = useServiceManager();
    const [serviceTypes, setServiceTypes] = useState<any[]>([]);
    const [serviceCodes, setServiceCodes] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen && !service) {
            // load dropdown khi thêm mới
            getAllServiceType().then(setServiceTypes);
            getAllServiceCode().then(setServiceCodes);
        }

        if (service) {
            setForm({
                serviceCode: service.serviceCode,
                serviceName: service.serviceName,
                price: service.price,
                duration: service.duration,
                size: service.size,
                note: service.note || "",
                serviceTypeName: service.serviceTypeName,
                serviceTypeCode: service.serviceTypeCode,
            });
        } else {
            setForm({
                serviceCode: "",
                serviceName: "",
                price: 0,
                duration: "",
                size: "",
                note: "",
                serviceTypeName: "",
                serviceTypeCode: "",
            });
        }
    }, [service, isOpen]);

    const handleChange = (key: keyof typeof form, value: any) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = () => {
        const payload = {
            serviceCode: form.serviceCode,
            serviceName: form.serviceName,
            price: form.price,
            duration: form.duration,
            size: form.size,
            note: form.note,
        };
        onSave(payload);
        onOpenChange(false);
    };

    const isEdit = !!service;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Chỉnh sửa dịch vụ" : "Thêm mới dịch vụ"}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Cập nhật thông tin dịch vụ."
                            : "Điền thông tin để tạo một dịch vụ mới."}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Tên loại DV */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Tên loại DV</Label>
                        {isEdit ? (
                            <Input value={form.serviceTypeName} disabled className="col-span-3" />
                        ) : (
                            <select
                                className="col-span-3 border rounded p-2"
                                value={form.serviceTypeCode}
                                onChange={(e) => {
                                    const selected = serviceTypes.find((t) => t.code === e.target.value);
                                    handleChange("serviceTypeCode", selected?.code || "");
                                    handleChange("serviceTypeName", selected?.serviceTypeName || "");
                                }}
                            >
                                <option value="">-- Chọn loại dịch vụ --</option>
                                {serviceTypes.map((t) => (
                                    <option key={t.code} value={t.code}>
                                        {t.serviceTypeName}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Mã loại DV */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Mã loại DV</Label>
                        <Input value={form.serviceTypeCode} disabled className="col-span-3" />
                    </div>

                    {/* Mã DV */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Mã DV</Label>
                        {isEdit ? (
                            <Input value={form.serviceCode} disabled className="col-span-3" />
                        ) : (
                            <select
                                className="col-span-3 border rounded p-2"
                                value={form.serviceCode}
                                onChange={(e) => {
                                    const selected = serviceCodes.find((s) => s.code === e.target.value);
                                    handleChange("serviceCode", selected?.code || "");
                                    handleChange("serviceName", selected?.serviceName || "");
                                    handleChange("duration", selected?.duration || "");
                                    handleChange("note", selected?.note || "");
                                    handleChange("serviceTypeCode", selected?.serviceTypeCode || "");
                                }}
                            >
                                <option value="">-- Chọn mã dịch vụ --</option>
                                {serviceCodes.map((s) => (
                                    <option key={s.id} value={s.code}>
                                        {s.code} - {s.serviceName}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Tên DV */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Tên DV</Label>
                        <Input value={form.serviceName} disabled className="col-span-3" />
                    </div>
                    
                    {/* Giá tiền */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Giá tiền</Label>
                        <Input
                            type="number"
                            value={form.price}
                            onChange={(e) => handleChange("price", Number(e.target.value))}
                            className="col-span-3"
                        />
                    </div>
                    {/* Thời lượng */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Thời lượng</Label>
                        <Input
                            value={form.duration}
                            onChange={(e) => handleChange("duration", e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    {/* Size */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Size</Label>
                        <Input
                            value={form.size}
                            onChange={(e) => handleChange("size", e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    {/* Ghi chú */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Ghi chú</Label>
                        <Textarea
                            value={form.note}
                            onChange={(e) => handleChange("note", e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit}>
                        Lưu
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
