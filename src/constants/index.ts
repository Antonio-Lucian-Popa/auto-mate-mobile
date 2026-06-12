import type { ReminderType, CostCategory, DocumentType, FuelType, ExpenseCategory, UserRole } from "@/types";

export const REMINDER_TYPES: { value: ReminderType; label: string; icon: string }[] = [
  { value: "RCA", label: "RCA", icon: "ShieldCheck" },
  { value: "CASCO", label: "CASCO", icon: "ShieldAlert" },
  { value: "ITP", label: "ITP", icon: "ClipboardCheck" },
  { value: "ROVINIETA", label: "Rovinietă", icon: "Ticket" },
  { value: "SERVICE", label: "Service", icon: "Wrench" },
  { value: "OIL_CHANGE", label: "Schimb ulei", icon: "Droplet" },
  { value: "TIRES", label: "Anvelope", icon: "CircleDot" },
  { value: "BRAKE_PADS", label: "Plăcuțe frână", icon: "Disc" },
  { value: "DISTRIBUTION_BELT", label: "Curea distribuție", icon: "Cog" },
  { value: "BATTERY", label: "Baterie", icon: "BatteryCharging" },
  { value: "CUSTOM", label: "Personalizat", icon: "Bell" },
];

export const COST_CATEGORIES: { value: CostCategory; label: string; icon: string; color: string }[] = [
  { value: "FUEL", label: "Carburant", icon: "Fuel", color: "#5B8DEF" },
  { value: "REPAIR", label: "Reparație", icon: "Hammer", color: "#F87171" },
  { value: "SERVICE", label: "Service", icon: "Wrench", color: "#FBBF24" },
  { value: "INSURANCE", label: "Asigurare", icon: "ShieldCheck", color: "#34D399" },
  { value: "ROAD_TAX", label: "Taxă drum", icon: "Road", color: "#A78BFA" },
  { value: "ROVINIETA", label: "Rovinietă", icon: "Ticket", color: "#22D3EE" },
  { value: "ITP", label: "ITP", icon: "ClipboardCheck", color: "#FB923C" },
  { value: "PARKING", label: "Parcare", icon: "ParkingCircle", color: "#94A3B8" },
  { value: "WASHING", label: "Spălare", icon: "Droplets", color: "#38BDF8" },
  { value: "PARTS", label: "Piese", icon: "Cog", color: "#F472B6" },
  { value: "OTHER", label: "Altele", icon: "MoreHorizontal", color: "#6B7693" },
];

export const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: "RCA", label: "RCA" },
  { value: "CASCO", label: "CASCO" },
  { value: "ITP", label: "ITP" },
  { value: "ROVINIETA", label: "Rovinietă" },
  { value: "INVOICE", label: "Factură" },
  { value: "FUEL_RECEIPT", label: "Bon carburant" },
  { value: "SERVICE_RECEIPT", label: "Bon service" },
  { value: "OTHER", label: "Altele" },
];

export const FUEL_TYPES: { value: FuelType; label: string }[] = [
  { value: "benzina", label: "Benzină" },
  { value: "motorina", label: "Motorină" },
  { value: "gpl", label: "GPL" },
  { value: "electric", label: "Electric" },
  { value: "hybrid", label: "Hibrid" },
];

export const FUEL_STATIONS = ["OMV", "Petrom", "MOL", "Rompetrol", "Lukoil", "Socar", "Gazprom", "Shell", "Altă stație"];

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string; icon: string; color: string }[] = [
  { value: "COMBUSTIBIL", label: "Combustibil", icon: "Fuel", color: "#5B8DEF" },
  { value: "MASA", label: "Masă", icon: "Utensils", color: "#FBBF24" },
  { value: "CAZARE", label: "Cazare", icon: "BedDouble", color: "#34D399" },
  { value: "TRANSPORT", label: "Transport", icon: "Train", color: "#A78BFA" },
  { value: "DIURNA", label: "Diurnă", icon: "Banknote", color: "#22D3EE" },
  { value: "ALTELE", label: "Altele", icon: "MoreHorizontal", color: "#6B7693" },
];

export const TRIP_STATUS_META: Record<string, { label: string; color: string }> = {
  DRAFT:     { label: "Ciornă",    color: "#6B7693" },
  ACTIVE:    { label: "Activă",    color: "#34D399" },
  CLOSED:    { label: "Închisă",   color: "#FBBF24" },
  SUBMITTED: { label: "Trimisă",   color: "#5B8DEF" },
  APPROVED:  { label: "Aprobată",  color: "#22D3EE" },
  REJECTED:  { label: "Respinsă",  color: "#F87171" },
};

export const USER_ROLE_META: Record<UserRole, { label: string; color: string }> = {
  ADMIN:       { label: "Admin",      color: "#F87171" },
  MANAGER:     { label: "Manager",    color: "#5B8DEF" },
  ACCOUNTANT:  { label: "Contabil",   color: "#34D399" },
  EMPLOYEE:    { label: "Angajat",    color: "#A78BFA" },
};
