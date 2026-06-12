import { useState } from "react";
import { View, Text, ScrollView, Alert, TouchableOpacity, TextInput, Modal } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/Skeleton";
import { useTrip, useCloseTrip, useSubmitTrip, useApproveTrip, useRejectTrip } from "@/hooks/useTrips";
import { useRole } from "@/hooks/useRole";
import { formatRONValue } from "@/lib/format";
import { formatDate } from "@/lib/date";
import { TRIP_STATUS_META } from "@/constants";
import { Plus, Receipt } from "lucide-react-native";
import { colors } from "@/constants/theme";

type ModalState = { type: "close" | "reject" | null; value: string };

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: trip, isLoading } = useTrip(id);
  const { canApprove } = useRole();
  const closeTrip = useCloseTrip();
  const submitTrip = useSubmitTrip();
  const approveTrip = useApproveTrip();
  const rejectTrip = useRejectTrip();
  const [modal, setModal] = useState<ModalState>({ type: null, value: "" });

  const handleModalConfirm = () => {
    if (!trip) return;
    if (modal.type === "close") {
      const kmEnd = modal.value ? parseInt(modal.value) : undefined;
      closeTrip.mutate({ id: trip.id, kmEnd });
    } else if (modal.type === "reject") {
      if (!modal.value.trim()) return;
      rejectTrip.mutate({ id: trip.id, reason: modal.value.trim() });
    }
    setModal({ type: null, value: "" });
  };

  if (isLoading) {
    return (
      <Screen className="flex-1 bg-bg">
        <ScreenHeader title="Delegație" onBack={() => router.back()} />
        <SkeletonList count={4} />
      </Screen>
    );
  }

  if (!trip) {
    return (
      <Screen className="flex-1 bg-bg">
        <ScreenHeader title="Delegație" onBack={() => router.back()} />
        <EmptyState title="Delegație negăsită" description="Această delegație nu există sau a fost ștearsă." />
      </Screen>
    );
  }

  const statusMeta = TRIP_STATUS_META[trip.status] ?? { label: trip.status, color: "#6B7693" };
  const isActive = trip.status === "ACTIVE";
  const isDraft = trip.status === "DRAFT";
  const isClosed = trip.status === "CLOSED";
  const isSubmitted = trip.status === "SUBMITTED";

  return (
    <Screen className="flex-1 bg-bg">
      <ScreenHeader title={trip.destination} onBack={() => router.back()} />

      {/* Modal pentru close/reject */}
      <Modal visible={modal.type !== null} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center px-6">
          <View className="bg-bg-card rounded-2xl p-6 gap-4">
            <Text className="text-ink font-bold text-lg">
              {modal.type === "close" ? "Închide delegația" : "Respinge delegația"}
            </Text>
            <TextInput
              value={modal.value}
              onChangeText={(v) => setModal((m) => ({ ...m, value: v }))}
              placeholder={modal.type === "close" ? "KM final (opțional)" : "Motivul respingerii *"}
              placeholderTextColor={colors.inkFaint}
              keyboardType={modal.type === "close" ? "number-pad" : "default"}
              className="bg-bg-elevated border border-line rounded-xl px-4 py-3 text-ink"
              style={{ color: colors.ink }}
            />
            <View className="flex-row gap-3">
              <AppButton title="Anulează" variant="secondary" onPress={() => setModal({ type: null, value: "" })} className="flex-1" />
              <AppButton
                title="Confirmă"
                variant={modal.type === "reject" ? "danger" : "primary"}
                onPress={handleModalConfirm}
                loading={closeTrip.isPending || rejectTrip.isPending}
                className="flex-1"
              />
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 60 }}>
        {/* Status + info */}
        <AppCard>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-ink font-bold text-lg">{trip.destination}</Text>
            <Badge label={statusMeta.label} color={statusMeta.color} />
          </View>
          {trip.purpose && <Text className="text-ink-soft mb-1">{trip.purpose}</Text>}
          <Text className="text-ink-soft text-sm">Start: {formatDate(trip.startDate)}</Text>
          {trip.endDate && <Text className="text-ink-soft text-sm">Sfârșit: {formatDate(trip.endDate)}</Text>}
          {trip.budget != null && (
            <View className="flex-row justify-between mt-3 pt-3 border-t border-line">
              <Text className="text-ink-soft">Buget</Text>
              <Text className="text-ink font-semibold">{formatRONValue(trip.budget)} RON</Text>
            </View>
          )}
          {trip.totalExpenses != null && (
            <View className="flex-row justify-between mt-2">
              <Text className="text-ink-soft">Cheltuieli</Text>
              <Text className="text-ink font-semibold">{formatRONValue(trip.totalExpenses)} RON</Text>
            </View>
          )}
          {trip.kmStart != null && (
            <View className="flex-row justify-between mt-2">
              <Text className="text-ink-soft">KM start</Text>
              <Text className="text-ink">{trip.kmStart} km</Text>
            </View>
          )}
          {trip.kmEnd != null && (
            <View className="flex-row justify-between mt-2">
              <Text className="text-ink-soft">KM final</Text>
              <Text className="text-ink">{trip.kmEnd} km</Text>
            </View>
          )}
          {trip.rejectionReason && (
            <View className="mt-3 pt-3 border-t border-line">
              <Text className="text-danger text-sm">Motiv respingere: {trip.rejectionReason}</Text>
            </View>
          )}
        </AppCard>

        {/* Cheltuieli */}
        <View>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-ink font-semibold">Cheltuieli</Text>
            {(isActive || isDraft) && (
              <TouchableOpacity
                onPress={() => router.push({ pathname: "/expenses/add", params: { tripId: trip.id } })}
                className="flex-row items-center gap-1"
              >
                <Plus size={16} color="#5B8DEF" />
                <Text className="text-brand-glow text-sm font-semibold">Adaugă</Text>
              </TouchableOpacity>
            )}
          </View>
          {trip.expenses?.length ? (
            <View className="gap-2">
              {trip.expenses.map((exp) => (
                <AppCard key={exp.id}>
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-ink font-medium">{exp.category}</Text>
                      <Text className="text-ink-soft text-sm">{formatDate(exp.date)}</Text>
                      {exp.merchant && <Text className="text-ink-soft text-sm">{exp.merchant}</Text>}
                    </View>
                    <Text className="text-ink font-bold">{formatRONValue(exp.amount)} {exp.currency}</Text>
                  </View>
                </AppCard>
              ))}
            </View>
          ) : (
            <View className="bg-bg-card border border-line rounded-2xl p-5 items-center">
              <Receipt size={24} color="#6B7693" />
              <Text className="text-ink-soft mt-2">Nicio cheltuială înregistrată</Text>
            </View>
          )}
        </View>

        {/* Acțiuni */}
        <View className="gap-3 mt-2">
          {(isActive || isDraft) && (
            <AppButton
              title="Închide delegația"
              onPress={() => setModal({ type: "close", value: "" })}
              loading={closeTrip.isPending}
              variant="secondary"
            />
          )}
          {isClosed && (
            <AppButton
              title="Trimite spre aprobare"
              onPress={() => submitTrip.mutate(trip.id)}
              loading={submitTrip.isPending}
            />
          )}
          {isSubmitted && canApprove() && (
            <View className="gap-2">
              <AppButton title="Aprobă" onPress={() => approveTrip.mutate(trip.id)} loading={approveTrip.isPending} />
              <AppButton
                title="Respinge"
                onPress={() => setModal({ type: "reject", value: "" })}
                loading={rejectTrip.isPending}
                variant="danger"
              />
            </View>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
