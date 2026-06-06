import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { remindersApi, type ReminderInput } from "@/services/api/reminders";

export function useReminders() {
  return useQuery({ queryKey: ["reminders"], queryFn: remindersApi.listAll });
}

export function useCarReminders(carId?: string) {
  return useQuery({
    queryKey: ["reminders", "car", carId],
    queryFn: () => remindersApi.listByCar(carId!),
    enabled: !!carId,
  });
}

export function useCreateReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ carId, data }: { carId: string; data: Omit<ReminderInput, "carId"> }) =>
      remindersApi.create(carId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reminders"] }),
  });
}

export function useRenewReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => remindersApi.renew(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reminders"] }),
  });
}

export function useDeleteReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => remindersApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reminders"] }),
  });
}
