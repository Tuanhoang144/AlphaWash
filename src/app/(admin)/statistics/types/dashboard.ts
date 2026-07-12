export interface DashboardData {
  kpiSummary: KpiSummary;
  revenueDashboard: RevenueDashboard;
  profitDashboard: ProfitDashboard;
  servicePerformance: ServicePerformance;
  customerAnalytics: CustomerAnalytics;
  employeePerformance: EmployeePerformanceItem[];
  workshopOperations: WorkshopOperations;
  financialHealth: FinancialHealth;
  businessGoals: BusinessGoals;
  alerts: Alert[];
}

export interface KpiSummary {
  todayRevenue: number;
  yesterdayRevenue: number;
  periodRevenue: number;
  comparePeriodRevenue: number;
  periodProfit: number;
  comparePeriodProfit: number;
  periodCost: number;
  periodInvoices: number;
  comparePeriodInvoices: number;
  periodVehicles: number;
  comparePeriodVehicles: number;
  avgInvoiceValue: number;
  compareAvgInvoiceValue: number;
  profitMargin: number;
  compareProfitMargin: number;
  revenueSparkline: number[];
}

export interface RevenueDashboard {
  revenueByDay: DailyRevenue[];
  revenueByMonth: MonthlyRevenue[];
  revenueByCategory: CategoryRevenue[];
  revenueByPaymentMethod: PaymentMethodRevenue[];
  revenueByEmployee: EmployeeRevenue[];
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
  invoiceCount: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  cost: number;
  profit: number;
}

export interface CategoryRevenue {
  category: string;
  revenue: number;
  count: number;
}

export interface PaymentMethodRevenue {
  method: string;
  amount: number;
  count: number;
}

export interface EmployeeRevenue {
  employeeName: string;
  revenue: number;
  invoiceCount: number;
}

export interface ProfitDashboard {
  totalRevenue: number;
  serviceRevenue: number;
  productRevenue: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: number;
  tipTotal: number;
}

export interface ServicePerformance {
  topByCount: ServiceStat[];
  topByRevenue: ServiceStat[];
  categoryDistribution: CategoryDistribution[];
  productAttachRate: number;
}

export interface ServiceStat {
  serviceName: string;
  serviceCode: string;
  count: number;
  revenue: number;
  avgPrice: number;
}

export interface CategoryDistribution {
  category: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface CustomerAnalytics {
  newCustomers: number;
  returningCustomers: number;
  retentionRate: number;
  avgSpending: number;
  avgLifetimeValue: number;
  topCustomers: VipCustomer[];
  avgVisitFrequency: number;
  totalCustomers: number;
}

export interface VipCustomer {
  customerName: string;
  phone: string;
  totalSpent: number;
  visitCount: number;
  lastVisit: string;
}

export interface EmployeePerformanceItem {
  employeeName: string;
  employeeId: number;
  revenue: number;
  invoiceCount: number;
  avgInvoice: number;
  servicesSold: number;
  productsSold: number;
}

export interface WorkshopOperations {
  vehiclesInShop: number;
  completedToday: number;
  todayOrders: number;
  avgTurnaroundMinutes: number;
}

export interface FinancialHealth {
  outstandingPayments: number;
  outstandingCount: number;
  inventoryValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  dailyCashFlow: DailyCashFlow[];
}

export interface DailyCashFlow {
  date: string;
  inflow: number;
  outflow: number;
  net: number;
}

export interface BusinessGoals {
  revenueGoal: GoalProgress;
  profitGoal: GoalProgress;
  vehicleGoal: GoalProgress;
  customerGoal: GoalProgress;
}

export interface GoalProgress {
  target: number;
  current: number;
  percentage: number;
  remaining: number;
  daysLeft: number;
}

export interface Alert {
  type: string;
  severity: string;
  title: string;
  message: string;
  count: number;
}

export interface DateRange {
  startDate: string;
  endDate: string;
  compareStartDate: string;
  compareEndDate: string;
  label: string;
}
