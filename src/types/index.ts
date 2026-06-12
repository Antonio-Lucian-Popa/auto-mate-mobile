/** Tipuri partajate in toata aplicatia */

export type UserRole = "ADMIN" | "MANAGER" | "ACCOUNTANT" | "EMPLOYEE";

export type User = {
  id: string;
  email: string;
  name?: string;
  companyId?: string;
  role?: UserRole;
  isActive?: boolean;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type Company = {
  id: string;
  name: string;
  cui?: string;
  address?: string;
  phone?: string;
  email?: string;
};

export type CompanyUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role: UserRole;
  isActive: boolean;
  companyId: string;
};

export type FuelType = "benzina" | "motorina" | "gpl" | "electric" | "hybrid";

export type Car = {
  id: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  vin?: string;
  fuelType: FuelType;
  currentMileage: number;
  photoUri?: string;
  assignedUserId?: string;
  createdAt?: string;
};

export type CarStatus = "ok" | "expiring" | "overdue" | "service";

export type ReminderType =
  | "RCA" | "CASCO" | "ITP" | "ROVINIETA" | "SERVICE" | "OIL_CHANGE"
  | "TIRES" | "BRAKE_PADS" | "DISTRIBUTION_BELT" | "BATTERY" | "CUSTOM";

export type ReminderStatus = "active" | "done" | "overdue";

export type Reminder = {
  id: string;
  carId: string;
  title: string;
  type: ReminderType;
  dueDate: string;
  dueMileage?: number;
  repeatIntervalMonths?: number;
  notes?: string;
  status: ReminderStatus;
};

export type CostCategory =
  | "FUEL" | "REPAIR" | "SERVICE" | "INSURANCE" | "ROAD_TAX" | "ROVINIETA"
  | "ITP" | "PARKING" | "WASHING" | "PARTS" | "OTHER";

export type Cost = {
  id: string;
  carId: string;
  category: CostCategory;
  amount: number;
  currency: "RON";
  date: string;
  mileage?: number;
  vendor?: string;
  notes?: string;
  receiptImageUri?: string;
};

export type FuelLog = {
  id: string;
  carId: string;
  date: string;
  station?: string;
  fuelType: FuelType;
  liters: number;
  pricePerLiter: number;
  total: number;
  mileage?: number;
  fullTank: boolean;
  receiptImageUri?: string;
};

export type DocumentType =
  | "RCA" | "CASCO" | "ITP" | "ROVINIETA" | "INVOICE"
  | "FUEL_RECEIPT" | "SERVICE_RECEIPT" | "OTHER";

export type CarDocument = {
  id: string;
  carId: string;
  type: DocumentType;
  title: string;
  imageUri: string;
  mimeType?: string;
  fileName?: string;
  linkedCostId?: string;
  linkedReminderId?: string;
  createdAt: string;
};

// ---- B2B types ----

export type ExpenseCategory =
  | "COMBUSTIBIL" | "MASA" | "CAZARE" | "TRANSPORT" | "DIURNA" | "ALTELE";

export type TripStatus =
  | "DRAFT" | "ACTIVE" | "CLOSED" | "SUBMITTED" | "APPROVED" | "REJECTED";

export type Trip = {
  id: string;
  userId: string;
  companyId: string;
  destination: string;
  purpose?: string;
  startDate: string;
  endDate?: string;
  budget?: number;
  carId?: string;
  kmStart?: number;
  kmEnd?: number;
  status: TripStatus;
  totalExpenses?: number;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  car?: Pick<Car, "id" | "brand" | "model" | "licensePlate">;
  user?: Pick<CompanyUser, "id" | "email" | "firstName" | "lastName">;
  expenses?: Expense[];
};

export type Expense = {
  id: string;
  userId: string;
  companyId: string;
  tripId?: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  date: string;
  merchant?: string;
  merchantCif?: string;
  notes?: string;
  imageUrl?: string;
  verified?: boolean;
  createdAt: string;
};

export type OcrResult = {
  amount?: number;
  currency?: string;
  date?: string;
  merchant?: string;
  cif?: string;
  category?: ExpenseCategory;
  confidence: "high" | "medium" | "low";
};

export type Report = {
  id: string;
  companyId: string;
  userId?: string;
  tripId?: string;
  type: "TRIP" | "MONTHLY";
  title: string;
  month?: string;
  fileUrl?: string;
  createdAt: string;
};

export type FleetDocumentStatus = "valid" | "expires_soon" | "expired";

export type FleetDocument = {
  title: string;
  category: string;
  expiresAt: string;
  daysLeft: number;
  status: FleetDocumentStatus;
};

export type FleetCar = {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  assignedUser?: Pick<CompanyUser, "id" | "email" | "firstName" | "lastName">;
  documents: FleetDocument[];
  totalCosts12m: number;
};

export type StatsSummary = {
  activeTrip?: {
    id: string;
    destination: string;
    startDate: string;
    runningTotal: number;
    budget?: number;
    budgetRemaining?: number;
  };
  currentMonth: {
    label: string;
    total: number;
    byCategory: Record<string, number>;
    count: number;
  };
  expiringDocuments: {
    title: string;
    category: string;
    expiresAt: string;
    daysLeft: number;
    car: string;
  }[];
};
