"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" // Import Input component
import { PlusIcon } from "lucide-react"

interface EmployeeManagementHeaderProps {
  onAddEmployee: () => void
  onSearch: (searchTerm: string) => void // New prop for search
}

export function EmployeeManagementHeader({ onAddEmployee, onSearch }: EmployeeManagementHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      {/* Thay thế h1 bằng Input */}
      <Input
        type="text"
        placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
        className="max-w-sm flex-grow mr-4" // Make it long and take available space
        onChange={(e) => onSearch(e.target.value)}
      />
      <Button onClick={onAddEmployee}>
        <PlusIcon className="mr-2 h-4 w-4" />
        Thêm nhân viên mới
      </Button>
    </div>
  )
}
