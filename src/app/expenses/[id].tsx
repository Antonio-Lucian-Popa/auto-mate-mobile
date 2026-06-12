import { useState } from "react";
import { View, Text, ScrollView, Alert, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "@/components/ui/AppButton";
import { Badge } from "@/components/ui/Badge";
import { SkeletonList } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useExpense, useDeleteExpense } from "@/hooks/useExpenses";
import { EXPENSE_CATEGORIES } from "@/constants";
import { formatDate } from "@/lib/date";
import { formatRONValue } from "@/lib/format";
import { Trash2, Image as ImageIcon } from "lucide-react-native";

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: expense, isLoading } = useExpense(id);
  const deleteExpense = useDeleteExpense();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = () => {
    Alert.alert("Șterge cheltuiala", "Această acțiune nu poate fi anulată.", [
      { text: "Renunță", style: "cancel" },
      {
        text: "Șterge",
        style: "destructive",
        onPress: async () => {
          setDeleting(true);
          try {
            await deleteExpense.mutateAsync(id);
            router.back();
          } catch (e: any) {
            Alert.alert("Eroare", e.message);
            setDeleting(false);
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <Screen className="flex-1 bg-bg">
        <ScreenHeader title="Cheltuială" onBack={() => router.back()} />
        <SkeletonList count={3} />
      </Screen>
    );
  }

  if (!expense) {
    return (
      <Screen className="flex-1 bg-bg">
        <ScreenHeader title="Cheltuială" onBack={() => router.back()} />
        <EmptyState title="Cheltuiala nu există" description="A fost ștearsă sau nu mai este disponibilă." />
      </Screen>
    );
  }

  const catMeta = EXPENSE_CATEGORIES.find((c) => c.value === expense.category);

  return (
    <Screen className="flex-1 bg-bg">
      <ScreenHeader
        title="Cheltuială"
        onBack={() => router.back()}
        right={
          <TouchableOpacity
            onPress={handleDelete}
            className="w-10 h-10 rounded-xl bg-danger/10 border border-danger/30 items-center justify-center active:opacity-70"
          >
            <Trash2 size={18} color="#F87171" />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}>
        <AppCard>
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              {catMeta && <Badge label={catMeta.label} color={catMeta.color} />}
            </View>
            <Text className="text-ink text-2xl font-bold">
              {formatRONValue(expense.amount)} <Text className="text-base font-normal text-ink-soft">{expense.currency}</Text>
            </Text>
          </View>

          <View className="gap-2">
            <Row label="Data" value={formatDate(expense.date)} />
            {expense.merchant && <Row label="Comerciant" value={expense.merchant} />}
            {expense.merchantCif && <Row label="CIF" value={expense.merchantCif} />}
            {expense.tripId && <Row label="Delegație ID" value={expense.tripId} />}
            {expense.notes && <Row label="Note" value={expense.notes} />}
            <Row label="Verificat" value={expense.verified ? "Da" : "Nu"} />
          </View>
        </AppCard>

        {expense.imageUrl && (
          <AppCard>
            <View className="flex-row items-center gap-2 mb-3">
              <ImageIcon size={16} color="#5B8DEF" />
              <Text className="text-ink font-semibold">Bon atașat</Text>
            </View>
            <TouchableOpacity onPress={() => {}}>
              {/* eslint-disable-next-line @typescript-eslint/no-require-imports */}
              <View className="bg-bg-elevated rounded-xl h-48 items-center justify-center">
                <Text className="text-ink-soft text-sm">Apasă pentru a vedea bonul</Text>
              </View>
            </TouchableOpacity>
          </AppCard>
        )}

        {expense.tripId && (
          <AppButton
            title="Vezi delegația"
            variant="secondary"
            onPress={() => router.push(`/trips/${expense.tripId}`)}
          />
        )}
      </ScrollView>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-1.5 border-b border-line/50">
      <Text className="text-ink-soft text-sm">{label}</Text>
      <Text className="text-ink text-sm font-medium flex-1 text-right ml-4" numberOfLines={2}>{value}</Text>
    </View>
  );
}
