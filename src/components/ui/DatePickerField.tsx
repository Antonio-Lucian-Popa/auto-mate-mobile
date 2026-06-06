import { useMemo, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react-native";
import { colors } from "@/constants/theme";
import { cn } from "@/lib/cn";
import { formatDate, todayISO } from "@/lib/date";

type Props = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
};

const DAY_LABELS = ["Lu", "Ma", "Mi", "Jo", "Vi", "Sa", "Du"];
const MONTHS = [
  "Ianuarie",
  "Februarie",
  "Martie",
  "Aprilie",
  "Mai",
  "Iunie",
  "Iulie",
  "August",
  "Septembrie",
  "Octombrie",
  "Noiembrie",
  "Decembrie",
];

function parseISODate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return parseISODate(todayISO());
  return new Date(year, month - 1, day);
}

function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function monthGrid(monthDate: Date): Date[] {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const mondayOffset = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

export function DatePickerField({ label, value, onChange, error, className }: Props) {
  const selectedDate = useMemo(() => parseISODate(value || todayISO()), [value]);
  const [visible, setVisible] = useState(false);
  const [monthDate, setMonthDate] = useState(selectedDate);

  const dates = useMemo(() => monthGrid(monthDate), [monthDate]);
  const today = useMemo(() => parseISODate(todayISO()), []);

  const open = () => {
    setMonthDate(selectedDate);
    setVisible(true);
  };

  const shiftMonth = (amount: number) => {
    setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  };

  const selectDate = (date: Date) => {
    onChange(toISODate(date));
    setVisible(false);
  };

  return (
    <View className={cn("gap-2", className)}>
      {label && <Text className="text-ink-soft text-sm font-medium">{label}</Text>}
      <Pressable
        onPress={open}
        className={cn(
          "flex-row items-center gap-3 bg-bg-soft border rounded-2xl px-4 h-14 active:opacity-80",
          error ? "border-danger" : "border-line"
        )}
      >
        <CalendarDays size={18} color={colors.inkFaint} />
        <Text className="flex-1 text-ink text-base" numberOfLines={1}>{formatDate(value)}</Text>
      </Pressable>
      {error && <Text className="text-danger text-xs">{error}</Text>}

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable className="flex-1 bg-black/60 justify-end" onPress={() => setVisible(false)}>
          <Pressable className="bg-bg border-t border-line px-5 pt-4 pb-6" onPress={() => {}}>
            <View className="flex-row items-center justify-between mb-4">
              <Pressable onPress={() => shiftMonth(-1)} className="w-11 h-11 rounded-2xl bg-bg-soft border border-line items-center justify-center active:opacity-70">
                <ChevronLeft size={22} color={colors.ink} />
              </Pressable>
              <Text className="text-ink text-lg font-bold">
                {MONTHS[monthDate.getMonth()]} {monthDate.getFullYear()}
              </Text>
              <Pressable onPress={() => shiftMonth(1)} className="w-11 h-11 rounded-2xl bg-bg-soft border border-line items-center justify-center active:opacity-70">
                <ChevronRight size={22} color={colors.ink} />
              </Pressable>
            </View>

            <View className="flex-row mb-2">
              {DAY_LABELS.map((day) => (
                <Text key={day} className="flex-1 text-center text-ink-faint text-xs font-semibold">
                  {day}
                </Text>
              ))}
            </View>

            <View className="flex-row flex-wrap">
              {dates.map((date) => {
                const iso = toISODate(date);
                const isSelected = sameDay(date, selectedDate);
                const isToday = sameDay(date, today);
                const inMonth = date.getMonth() === monthDate.getMonth();

                return (
                  <Pressable key={iso} onPress={() => selectDate(date)} style={{ width: `${100 / 7}%`, aspectRatio: 1 }} className="p-1 active:opacity-75">
                    <View
                      className={cn(
                        "flex-1 rounded-2xl items-center justify-center border",
                        isSelected ? "bg-brand border-brand" : isToday ? "border-brand bg-brand/10" : "border-transparent"
                      )}
                    >
                      <Text className={cn("text-base", isSelected ? "text-white font-bold" : inMonth ? "text-ink" : "text-ink-faint")}>
                        {date.getDate()}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View className="flex-row gap-3 mt-4">
              <Pressable onPress={() => selectDate(today)} className="flex-1 h-12 rounded-2xl bg-bg-soft border border-line items-center justify-center active:opacity-70">
                <Text className="text-ink-soft font-semibold">Azi</Text>
              </Pressable>
              <Pressable onPress={() => setVisible(false)} className="flex-1 h-12 rounded-2xl bg-brand items-center justify-center active:opacity-70">
                <Text className="text-white font-semibold">Gata</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
