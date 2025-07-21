"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Employee } from "@/types/Employee"

interface EmployeeDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  employee?: Employee | null // Optional, for editing
  onSave: (employee: Omit<Employee, "id"> & { id?: number }) => void
}

export function EmployeeDialog({ isOpen, onOpenChange, employee, onSave }: EmployeeDialogProps) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [note, setNote] = useState<string | null>("")

  useEffect(() => {
    if (employee) {
      setName(employee.name?.toString() ?? "")
      setPhone(employee.phone?.toString() ?? "")
      setNote(employee.note?.toString() ?? "")
    } else {
      // Reset form for new employee
      setName("")
      setPhone("")
      setNote("")
    }
  }, [employee, isOpen]) 

  const handleSubmit = () => {
    // Basic validation
    if (!name || !phone) {
      alert("Tên và Số điện thoại là bắt buộc.")
      return
    }

    const newEmployeeData = {
      id: employee?.id !== undefined ? Number(employee.id) : undefined, 
      name,
      phone,
      note: note || undefined,
    }
    onSave(newEmployeeData)
    onOpenChange(false) 
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{employee ? "Chỉnh sửa thông tin nhân viên" : "Tạo mới nhân viên"}</DialogTitle>
          <DialogDescription>
            {employee ? "Cập nhật thông tin của nhân viên." : "Điền thông tin để tạo một nhân viên mới."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Tên
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Điện thoại
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="col-span-3"
              type="tel"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="note" className="text-right">
              Ghi chú
            </Label>
            <Textarea id="note" value={note || ""} onChange={(e) => setNote(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
