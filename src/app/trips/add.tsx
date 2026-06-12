import { useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { AppButton } from "@/components/ui/AppButton";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { SegmentedField } from "@/components/forms/SegmentedField";
import { useCars } from "@/hooks/useCars";
import { useCreateTrip } from "@/hooks/useTrips";
import type { TripInput } from "@/services/api/trips";

type Form = {
  destination: string;
  purpose: string;
  startDate: string;
  endDate: string;
  budget: string;
  carId: string;
  kmStart: string;
};

export default function AddTripScreen() {
  const { control, handleSubmit } = useForm<Form>({
    defaultValues: { destination: "", purpose: "", startDate: new Date().toISOString().split("T")[0], endDate: "", budget: "", carId: "", kmStart: "" },
  });
  const { data: cars } = useCars();
  const createTrip = useCreateTrip();
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (d: Form) => {
    setErr(null);
    try {
      const input: TripInput = {
        destination: d.destination.trim(),
        purpose: d.purpose.trim() || undefined,
        startDate: d.startDate,
        endDate: d.endDate || undefined,
        budget: d.budget ? parseFloat(d.budget) : undefined,
        carId: d.carId || undefined,
        kmStart: d.kmStart ? parseInt(d.kmStart) : undefined,
      };
      await createTrip.mutateAsync(input);
      router.back();
    } catch (e: any) {
      setErr(e.message ?? "Eroare la creare delegație.");
    }
  };

  const carOptions = (cars ?? []).map((c) => ({ value: c.id, label: `${c.brand} ${c.model} (${c.licensePlate})` }));

  return (
    <Screen className="flex-1 bg-bg">
      <ScreenHeader title="Delegație nouă" onBack={() => router.back()} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Controller control={control} name="destination" rules={{ required: "Destinația este obligatorie" }} render={({ field: { value, onChange }, fieldState }) => (
            <AppTextInput label="Destinație *" placeholder="ex: Cluj-Napoca" value={value} onChangeText={onChange} error={fieldState.error?.message} />
          )} />
          <Controller control={control} name="purpose" render={({ field: { value, onChange } }) => (
            <AppTextInput label="Scopul deplasării" placeholder="ex: Întâlnire client" value={value} onChangeText={onChange} />
          )} />
          <Controller control={control} name="startDate" render={({ field: { value, onChange } }) => (
            <DatePickerField label="Data start *" value={value} onChange={onChange} />
          )} />
          <Controller control={control} name="endDate" render={({ field: { value, onChange } }) => (
            <DatePickerField label="Data sfârșit (opțional)" value={value} onChange={onChange} />
          )} />
          <Controller control={control} name="budget" render={({ field: { value, onChange } }) => (
            <AppTextInput label="Buget (RON)" placeholder="0.00" keyboardType="decimal-pad" value={value} onChangeText={onChange} />
          )} />
          {carOptions.length > 0 && (
            <Controller control={control} name="carId" render={({ field: { value, onChange } }) => (
              <SegmentedField label="Mașina (opțional)" options={[{ value: "", label: "Fără mașină" }, ...carOptions]} value={value} onChange={onChange} />
            )} />
          )}
          <Controller control={control} name="kmStart" render={({ field: { value, onChange } }) => (
            <AppTextInput label="KM start (opțional)" placeholder="ex: 45000" keyboardType="number-pad" value={value} onChangeText={onChange} />
          )} />
          {err && <Text className="text-danger text-sm text-center">{err}</Text>}
          <AppButton title="Creează delegație" onPress={handleSubmit(onSubmit)} loading={createTrip.isPending} className="mt-2" />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
