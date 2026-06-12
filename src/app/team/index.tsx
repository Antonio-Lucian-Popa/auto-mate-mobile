import { Alert, View, Text, ScrollView, RefreshControl } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "@/components/ui/AppButton";
import { Badge } from "@/components/ui/Badge";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/Skeleton";
import { useCompanyUsers, useRemoveUser } from "@/hooks/useUsers";
import { useRole } from "@/hooks/useRole";
import { USER_ROLE_META } from "@/constants";
import type { CompanyUser } from "@/types";
import { Users, UserPlus } from "lucide-react-native";

export default function TeamScreen() {
  const { data: users, isLoading, refetch, isRefetching } = useCompanyUsers();
  const { role, canInvite } = useRole();
  const removeUser = useRemoveUser();

  const confirmRemove = (userId: string, label: string, invitationPending?: boolean) => {
    Alert.alert(
      invitationPending ? "Anulezi invitația?" : "Scoți utilizatorul?",
      invitationPending
        ? `Invitația pentru ${label} va fi ștearsă.`
        : `${label} nu va mai avea acces la echipă.`,
      [
        { text: "Renunță", style: "cancel" },
        {
          text: invitationPending ? "Anulează" : "Scoate",
          style: "destructive",
          onPress: () => removeUser.mutate(userId),
        },
      ],
    );
  };

  return (
    <Screen className="flex-1 bg-bg">
      <ScreenHeader title="Echipă" />
      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#5B8DEF" />}
      >
        {isLoading ? (
          <SkeletonList count={4} />
        ) : !users?.length ? (
          <EmptyState
            icon={<Users size={32} color="#7FA8FF" />}
            title="Niciun utilizator"
            description="Invită colegi în echipă."
            actionLabel={canInvite() ? "Invită" : undefined}
            onAction={canInvite() ? () => router.push("/team/invite") : undefined}
          />
        ) : (
          users.map((user: CompanyUser) => {
            const roleMeta = USER_ROLE_META[user.role];
            const label = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
            const canRemoveUser = canInvite() && user.role !== "ADMIN" && (role === "ADMIN" || (user.role !== "MANAGER"));
            return (
              <AppCard key={user.id}>
                <View className="gap-3">
                  <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-3">
                    <Text className="text-ink font-semibold">
                      {label}
                    </Text>
                    <Text className="text-ink-soft text-sm">{user.email}</Text>
                  </View>
                  <View className="items-end gap-1">
                    <Badge
                      label={user.invitationPending ? "Invitație" : roleMeta?.label ?? user.role}
                      color={user.invitationPending ? "#FBBF24" : roleMeta?.color ?? "#6B7693"}
                    />
                    {!user.isActive && !user.invitationPending && <Text className="text-danger text-xs">Inactiv</Text>}
                  </View>
                  </View>
                  {canRemoveUser && (
                    <AppButton
                      title={user.invitationPending ? "Anulează invitația" : "Scoate din echipă"}
                      variant="danger"
                      onPress={() => confirmRemove(user.id, label, user.invitationPending)}
                      loading={removeUser.isPending}
                      className="h-11 rounded-xl"
                    />
                  )}
                </View>
              </AppCard>
            );
          })
        )}
      </ScrollView>
      {canInvite() && (
        <FloatingActionButton icon={<UserPlus size={22} color="#fff" />} onPress={() => router.push("/team/invite")} />
      )}
    </Screen>
  );
}
