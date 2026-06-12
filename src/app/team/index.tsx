import { View, Text, ScrollView, RefreshControl } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { AppCard } from "@/components/ui/AppCard";
import { Badge } from "@/components/ui/Badge";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/Skeleton";
import { useCompanyUsers } from "@/hooks/useUsers";
import { useRole } from "@/hooks/useRole";
import { USER_ROLE_META } from "@/constants";
import { Users, UserPlus } from "lucide-react-native";

export default function TeamScreen() {
  const { data: users, isLoading, refetch, isRefetching } = useCompanyUsers();
  const { canInvite } = useRole();

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
          users.map((user) => {
            const roleMeta = USER_ROLE_META[user.role];
            return (
              <AppCard key={user.id}>
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-ink font-semibold">
                      {[user.firstName, user.lastName].filter(Boolean).join(" ") || user.email}
                    </Text>
                    <Text className="text-ink-soft text-sm">{user.email}</Text>
                  </View>
                  <View className="items-end gap-1">
                    <Badge label={roleMeta?.label ?? user.role} color={roleMeta?.color ?? "#6B7693"} />
                    {!user.isActive && <Text className="text-danger text-xs">Inactiv</Text>}
                  </View>
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
