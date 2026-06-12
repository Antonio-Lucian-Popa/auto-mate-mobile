import { apiRequest } from "./client";
import type { Car } from "@/types";

export type CarInput = Omit<Car, "id" | "createdAt">;

type BackendCar = Omit<Car, "brand" | "licensePlate"> & {
  make?: string;
  brand?: string;
  plateNumber?: string;
  licensePlate?: string;
  assignedUserId?: string;
};

type BackendCarInput = Omit<CarInput, "brand" | "licensePlate"> & {
  make: string;
  plateNumber: string;
};

type BackendCarUpdateInput = Partial<Omit<CarInput, "brand" | "licensePlate">> & {
  make?: string;
  plateNumber?: string;
};

function toBackendCarInput(data: CarInput): BackendCarInput {
  const { brand, licensePlate, ...rest } = data;
  return { ...rest, make: brand, plateNumber: licensePlate };
}

function toBackendCarUpdateInput(data: Partial<CarInput>): BackendCarUpdateInput {
  const { brand, licensePlate, ...rest } = data;
  return {
    ...rest,
    ...(brand !== undefined ? { make: brand } : {}),
    ...(licensePlate !== undefined ? { plateNumber: licensePlate } : {}),
  };
}

function toCar(data: BackendCar): Car {
  return {
    ...data,
    brand: data.brand ?? data.make ?? "",
    licensePlate: data.licensePlate ?? data.plateNumber ?? "",
    assignedUserId: data.assignedUserId,
  };
}

export const carsApi = {
  list: async () => {
    const data = await apiRequest<BackendCar[]>("/cars");
    return data.map(toCar);
  },
  get: async (id: string) => {
    const data = await apiRequest<BackendCar>(`/cars/${id}`);
    return toCar(data);
  },
  create: async (data: CarInput) => {
    const car = await apiRequest<BackendCar>("/cars", { method: "POST", body: toBackendCarInput(data) });
    return toCar(car);
  },
  update: async (id: string, data: Partial<CarInput>) => {
    const car = await apiRequest<BackendCar>(`/cars/${id}`, { method: "PATCH", body: toBackendCarUpdateInput(data) });
    return toCar(car);
  },
  remove: (id: string) => apiRequest<void>(`/cars/${id}`, { method: "DELETE" }),
};
