import { View, Text, Pressable } from "react-native";
import { Bell, RefreshCw } from "lucide-react-native";
import { AppCard } from "@/components/ui/AppCard";
import { Badge } from "@/components/ui/Badge";
import { expiryLabel, daysUntil } from "@/lib/date";
import { REMINDER_TYPES } from "@/constants";
import type { Reminder } from "@/types";

function urgencyMeta(reminder: Reminder) {
  const d = daysUntil(reminder.dueDate);
  if (d < 0) return { color: "#F87171", bg: "rgba(248,113,113,0.14)" };
  if (d <= 14) return { color: "#FBBF24", bg: "rgba(251,191,36,0.14)" };
  return { color: "#34D399", bg: "rgba(52,211,153,0.14)" };
}

export function ReminderCard({ reminder, onPress, onRenew }: { reminder: Reminder; onPress?: () => void; onRenew?: () => void }) {
  const m = urgencyMeta(reminder);
  const typeLabel = REMINDER_TYPES.find((t) => t.value === reminder.type)?.label ?? reminder.type;
  return (
    <AppCard onPress={onPress}>
      <View className="flex-row items-center gap-3">
        <View className="w-11 h-11 rounded-2xl items-center justify-center" style={{ backgroundColor: m.bg }}>
          <Bell size={20} color={m.color} />
        </View>
        <View className="flex-1">
          <Text className="text-ink font-semibold">{reminder.title}</Text>
          <Text className="text-ink-faint text-xs">{typeLabel}</Text>
        </View>
        <View className="items-end gap-1.5">
          <Badge label={expiryLabel(reminder.dueDate)} color={m.color} bg={m.bg} />
          {onRenew && (
            <Pressable onPress={onRenew} className="flex-row items-center gap-1 active:opacity-60">
              <RefreshCw size={12} color="#7FA8FF" />
              <Text className="text-brand-glow text-xs">Reînnoiește</Text>
            </Pressable>
          )}
        </View>
      </View>
    </AppCard>
  );
}
