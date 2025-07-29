"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Car } from "lucide-react"
import BrandModelSelector from "./brand-model-selector"
import type { CustomerDTO, VehicleDTO } from "@/types/OrderResponse"

interface VehicleInfoBlockProps {
  vehicle: VehicleDTO
  onVehicleChange: (vehicle: VehicleDTO) => void
  customer?: CustomerDTO
}

export default function VehicleInfoBlock({ vehicle, onVehicleChange, customer }: VehicleInfoBlockProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Thông Tin Xe
        </CardTitle>
      </CardHeader>
      <CardContent>
        <BrandModelSelector vehicle={vehicle} onVehicleChange={onVehicleChange} customer={customer} />
      </CardContent>
    </Card>
  )
}