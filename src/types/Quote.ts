export interface QuoteItem {
  id?: string
  serviceId?: string
  serviceName: string
  brand?: string
  type?: string
  warranty?: string
  price: number
  isBonus: boolean
  sortOrder: number
}

export type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED'

export interface Quote {
  id: string
  quoteCode: string
  customerId?: string
  customerName: string
  customerPhone?: string
  vehicleId?: string
  licensePlate?: string
  carModel?: string
  carSize?: string
  quoteDate: string
  status: QuoteStatus
  subtotal: number
  discount: number
  extraCharge: number
  total: number
  notes?: string
  createdBy?: string
  items: QuoteItem[]
}

export interface QuoteListItem {
  id: string
  quoteCode: string
  customerName: string
  customerPhone?: string
  licensePlate?: string
  carModel?: string
  quoteDate: string
  total: number
  status: QuoteStatus
}

export interface QuotePage {
  content: QuoteListItem[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}
