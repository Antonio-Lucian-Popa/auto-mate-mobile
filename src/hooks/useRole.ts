import { useAuthStore } from "@/stores/authStore";
import type { UserRole } from "@/types";

export function useRole() {
  const role = useAuthStore((s) => s.user?.role);

  const is = (r: UserRole) => role === r;
  const isAdmin = () => is("ADMIN");
  const isManager = () => is("MANAGER");
  const isAccountant = () => is("ACCOUNTANT");
  const isEmployee = () => is("EMPLOYEE");

  /** Poate crea/edita/șterge mașini și gestiona flota */
  const canManageFleet = () => isAdmin() || isManager();

  /** Poate aproba sau respinge delegații */
  const canApprove = () => isAdmin() || isManager();

  /** Poate vedea fleet overview și rapoarte complete */
  const canViewFleet = () => isAdmin() || isManager() || isAccountant();

  /** Poate invita utilizatori */
  const canInvite = () => isAdmin() || isManager();

  /** Poate vedea setări companie */
  const canManageCompany = () => isAdmin();

  return { role, is, isAdmin, isManager, isAccountant, isEmployee, canManageFleet, canApprove, canViewFleet, canInvite, canManageCompany };
}
