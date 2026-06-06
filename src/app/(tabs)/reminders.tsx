import { useMemo } from "react";
import { View, Text, SectionList, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { BellPlus, Bell } from "lucide-react-native";
import { useReminders, useRenewReminder } from "@/hooks/useReminders";
import { ReminderCard } from "@/components/cards/ReminderCard";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/Skeleton";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import { daysUntil } from "@/lib/date";

export default function RemindersScreen() {
  const { data: reminders, isLoading } = useReminders();
  const renew = useRenewReminder();

  const sections = useMemo(() => {
    const active = (reminders ?? []).filter((r) => r.status !== "done");
    const overdue = active.filter((r) => daysUntil(r.dueDate) < 0).sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate));
    const soon = active.filter((r) => daysUntil(r.dueDate) >= 0 && daysUntil(r.dueDate) <= 30).sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate));
    const later = active.filter((r) => daysUntil(r.dueDate) > 30).sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate));
    return [
      { title: "Restante", data: overdue },
      { title: "Urmează curând", data: soon },
      { title: "Mai târziu", data: later },
    ].filter((s) => s.data.length);
  }, [reminders]);

  const onRenew = (id: string) => {
    Alert.alert("Reînnoiește reminder", "Vrei să reînnoiești acest reminder?", [
      { text: "Renunță", style: "cancel" },
      { text: "Reînnoiește", onPress: () => renew.mutate(id) },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-5 pt-2">
        <ScreenHeader title="Reminder-e" subtitle="RCA, ITP, rovinietă, service" />
        {isLoading ? (
          <SkeletonList count={4} />
        ) : !sections.length ? (
          <EmptyState
            icon={<Bell size={32} color="#7FA8FF" />}
            title="Niciun reminder"
            description="Adaugă remindere pentru RCA, ITP, rovinietă sau service și primești notificări la timp."
            actionLabel="Adaugă reminder"
            onAction={() => router.push("/reminders/add")}
          />
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(r) => r.id}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderSectionHeader={({ section }) => (
              <Text className="text-ink-faint text-xs uppercase tracking-wide mt-4 mb-2">{section.title}</Text>
            )}
            renderItem={({ item }) => (
              <View className="mb-3">
                <ReminderCard reminder={item} onPress={() => router.push(`/reminders/${item.id}`)} onRenew={() => onRenew(item.id)} />
              </View>
            )}
          />
        )}
      </View>
      <FloatingActionButton onPress={() => router.push("/reminders/add")} icon={<BellPlus size={26} color="#fff" />} />
    </SafeAreaView>
  );
}
