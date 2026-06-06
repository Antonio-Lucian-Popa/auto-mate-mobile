/** Tipuri partajate in toata aplicatia */

export type User = {
  id: string;
  email: string;
  name?: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
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
  dueDate: string; // ISO
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
  linkedCostId?: string;
  linkedReminderId?: string;
  createdAt: string;
};
