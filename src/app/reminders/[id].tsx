import { View, Text, ScrollView, Alert } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { router, useLocalSearchParams } from "expo-router";
import { Bell, Calendar, Gauge, RefreshCw, Repeat, FileText, Trash2, CarFront } from "lucide-react-native";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "@/components/ui/AppButton";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useReminders, useRenewReminder, useDeleteReminder } from "@/hooks/useReminders";
import { useCars } from "@/hooks/useCars";
import { REMINDER_TYPES } from "@/constants";
import { formatDate, expiryLabel, daysUntil } from "@/lib/date";
import { formatMileage } from "@/lib/format";
import { notificationService } from "@/services/notifications/notificationService";
import { useSettingsStore } from "@/stores/settingsStore";

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View className="flex-row items-center gap-3 py-3 border-b border-line/60">
      <View className="w-9 h-9 rounded-xl bg-bg-soft items-center justify-center">{icon}</View>
      <Text className="text-ink-soft flex-1">{label}</Text>
      <Text className="text-ink font-semibold">{value}</Text>
    </View>
  );
}

export default function ReminderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: reminders = [], isLoading } = useReminders();
  const { data: cars = [] } = useCars();
  const renew = useRenewReminder();
  const del = useDeleteReminder();
  const remindDays = useSettingsStore((s) => s.remindDaysBefore);
  const notifEnabled = useSettingsStore((s) => s.notificationsEnabled);

  const reminder = reminders.find((r) => r.id === id);

  if (!isLoading && !reminder) {
    return (
      <Screen className="flex-1 bg-bg">
        <View className="px-5 pt-2"><ScreenHeader title="Reminder" back /></View>
        <EmptyState icon={<Bell size={28} color="#6B7693" />} title="Reminder negăsit" description="Probabil a fost șters." actionLabel="Înapoi" onAction={() => router.back()} />
      </Screen>
    );
  }
  if (!reminder) return <Screen className="flex-1 bg-bg" />;

  const car = cars.find((c) => c.id === reminder.carId);
  const typeLabel = REMINDER_TYPES.find((t) => t.value === reminder.type)?.label ?? reminder.type;
  const d = daysUntil(reminder.dueDate);
  const meta = d < 0 ? { color: "#F87171", bg: "rgba(248,113,113,0.14)" } : d <= 14 ? { color: "#FBBF24", bg: "rgba(251,191,36,0.14)" } : { color: "#34D399", bg: "rgba(52,211,153,0.14)" };

  const onRenew = () => {
    Alert.alert("Reînnoiește reminder", "Marchează acest reminder ca reînnoit?", [
      { text: "Anulează", style: "cancel" },
      {
        text: "Reînnoiește",
        onPress: () => renew.mutate(reminder.id, {
          onSuccess: (renewed) => {
            if (notifEnabled) {
              notificationService.scheduleReminder(renewed, remindDays).catch(() => {});
            }
          },
        }),
      },
    ]);
  };
  const onDelete = () => {
    Alert.alert("Șterge reminder", "Sigur vrei să ștergi acest reminder?", [
      { text: "Anulează", style: "cancel" },
      { text: "Șterge", style: "destructive", onPress: () => del.mutate(reminder.id, { onSuccess: () => router.back() }) },
    ]);
  };

  return (
    <Screen className="flex-1 bg-bg">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <ScreenHeader title={reminder.title} subtitle={typeLabel} back />

        <AppCard className="items-center py-6 mb-4">
          <View className="w-16 h-16 rounded-3xl items-center justify-center mb-3" style={{ backgroundColor: meta.bg }}>
            <Bell size={28} color={meta.color} />
          </View>
          <Badge label={expiryLabel(reminder.dueDate)} color={meta.color} bg={meta.bg} />
        </AppCard>

        <AppCard className="mb-4">
          {car && <Row icon={<CarFront size={18} color="#7FA8FF" />} label="Mașină" value={`${car.brand} ${car.model}`} />}
          <Row icon={<Calendar size={18} color="#7FA8FF" />} label="Scadent la" value={formatDate(reminder.dueDate)} />
          {reminder.dueMileage ? <Row icon={<Gauge size={18} color="#7FA8FF" />} label="Km scadent" value={formatMileage(reminder.dueMileage)} /> : null}
          {reminder.repeatIntervalMonths ? <Row icon={<Repeat size={18} color="#7FA8FF" />} label="Se repetă la" value={`${reminder.repeatIntervalMonths} luni`} /> : null}
          {reminder.notes ? <Row icon={<FileText size={18} color="#7FA8FF" />} label="Note" value={reminder.notes} /> : null}
        </AppCard>

        <AppButton title="Reînnoiește reminderul" icon={<RefreshCw size={18} color="#fff" />} onPress={onRenew} loading={renew.isPending} className="mb-3" />
        <AppButton title="Șterge" variant="danger" icon={<Trash2 size={18} color="#F87171" />} onPress={onDelete} loading={del.isPending} />
      </ScrollView>
    </Screen>
  );
}
