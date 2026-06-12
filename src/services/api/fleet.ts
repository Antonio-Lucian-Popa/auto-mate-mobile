import { apiRequest } from "./client";
import type { FleetCar } from "@/types";

export const fleetApi = {
  overview: () => apiRequest<FleetCar[]>("/fleet/overview"),
};
