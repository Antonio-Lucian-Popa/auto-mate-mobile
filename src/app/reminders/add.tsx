import { useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { AppButton } from "@/components/ui/AppButton";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { SegmentedField } from "@/components/forms/SegmentedField";
import { EmptyState } from "@/components/ui/EmptyState";
import { useCreateReminder } from "@/hooks/useReminders";
import { useActiveCar } from "@/hooks/useActiveCar";
import { REMINDER_TYPES } from "@/constants";
import { todayISO } from "@/lib/date";
import { notificationService } from "@/services/notifications/notificationService";
import { useSettingsStore } from "@/stores/settingsStore";
import { CarFront } from "lucide-react-native";
import type { ReminderType } from "@/types";

type Form = { title: string; dueDate: string; dueMileage: string; repeat: string; notes: string };

export default function AddReminderScreen() {
  const { active, options, isLoading } = useActiveCar();
  const [carId, setCarId] = useState<string | undefined>(active?.id);
  const [type, setType] = useState<ReminderType>("ITP");
  const create = useCreateReminder();
  const remindDays = useSettingsStore((s) => s.remindDaysBefore);
  const notifEnabled = useSettingsStore((s) => s.notificationsEnabled);

  const { control, handleSubmit } = useForm<Form>({
    defaultValues: { title: "", dueDate: todayISO(), dueMileage: "", repeat: "", notes: "" },
  });

  const carValue = carId ?? active?.id;

  const onSubmit = (d: Form) => {
    if (!carValue) {
      Alert.alert("Selectează o mașină", "Adaugă întâi o mașină în garaj.");
      return;
    }
    const typeLabel = REMINDER_TYPES.find((t) => t.value === type)?.label ?? type;
    create.mutate(
      {
        carId: carValue,
        data: {
          title: d.title.trim() || typeLabel,
          type,
          dueDate: d.dueDate.trim(),
          dueMileage: d.dueMileage ? Number(d.dueMileage) : undefined,
          repeatIntervalMonths: d.repeat ? Number(d.repeat) : undefined,
          notes: d.notes.trim() || undefined,
        },
      },
      {
        onSuccess: (rem) => {
          if (notifEnabled) {
            notificationService.scheduleReminder(rem, remindDays).catch(() => {});
          }
          router.back();
        },
        onError: () => Alert.alert("Eroare", "Nu am putut salva reminderul. Încearcă din nou."),
      }
    );
  };

  if (!isLoading && options.length === 0) {
    return (
      <Screen className="flex-1 bg-bg">
        <View className="px-5 pt-2"><ScreenHeader title="Reminder nou" back /></View>
        <EmptyState
          icon={<CarFront size={30} color="#5B8DEF" />}
          title="Nicio mașină"
          description="Ai nevoie de cel puțin o mașină pentru a adăuga remindere."
          actionLabel="Adaugă mașină"
          onAction={() => router.replace("/car/add")}
        />
      </Screen>
    );
  }

  return (
    <Screen className="flex-1 bg-bg">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <ScreenHeader title="Reminder nou" subtitle="RCA, ITP, rovinietă, service și altele" back />

          {options.length > 1 && (
            <SegmentedField label="Mașină" options={options} value={carValue ?? ""} onChange={setCarId} />
          )}

          <SegmentedField
            label="Tip reminder"
            options={REMINDER_TYPES.map((t) => ({ value: t.value, label: t.label }))}
            value={type}
            onChange={(v) => setType(v as ReminderType)}
          />

          <Controller control={control} name="title" render={({ field: { value, onChange } }) => (
            <AppTextInput label="Titlu (opțional)" placeholder="ex: RCA Groupama" value={value} onChangeText={onChange} />
          )} />

          <Controller control={control} name="dueDate" rules={{ required: "Obligatoriu" }} render={({ field: { value, onChange }, fieldState }) => (
            <DatePickerField label="Data scadentă" value={value} onChange={onChange} error={fieldState.error?.message} />
          )} />

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Controller control={control} name="dueMileage" render={({ field: { value, onChange } }) => (
                <AppTextInput label="Km scadent (opțional)" placeholder="180000" keyboardType="number-pad" value={value} onChangeText={onChange} />
              )} />
            </View>
            <View className="flex-1">
              <Controller control={control} name="repeat" render={({ field: { value, onChange } }) => (
                <AppTextInput label="Repetă la (luni)" placeholder="12" keyboardType="number-pad" value={value} onChangeText={onChange} />
              )} />
            </View>
          </View>

          <Controller control={control} name="notes" render={({ field: { value, onChange } }) => (
            <AppTextInput label="Note (opțional)" placeholder="Detalii suplimentare" value={value} onChangeText={onChange} multiline />
          )} />

          <Text className="text-ink-faint text-xs px-1">
            Vei primi o notificare cu {remindDays} zile înainte de expirare.
          </Text>

          <AppButton title="Salvează reminderul" onPress={handleSubmit(onSubmit)} loading={create.isPending} className="mt-1" />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
