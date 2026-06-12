import { View, Text, ScrollView, Switch, Pressable, Alert } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { Bell, Palette, LogOut, User, ChevronRight, Users, Building2, FileText } from "lucide-react-native";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { AppCard } from "@/components/ui/AppCard";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/stores/authStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useRole } from "@/hooks/useRole";
import { USER_ROLE_META } from "@/constants";
import { router } from "expo-router";

function Row({ icon, label, value, onPress, right }: { icon: React.ReactNode; label: string; value?: string; onPress?: () => void; right?: React.ReactNode }) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center gap-3 py-3.5 active:opacity-70">
      <View className="w-9 h-9 rounded-xl bg-bg-elevated items-center justify-center">{icon}</View>
      <View className="flex-1">
        <Text className="text-ink font-medium">{label}</Text>
        {value && <Text className="text-ink-faint text-xs">{value}</Text>}
      </View>
      {right ?? (onPress && <ChevronRight size={18} color="#6B7693" />)}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { theme, notificationsEnabled, update } = useSettingsStore();
  const { canInvite, canManageCompany, canViewFleet } = useRole();
  const displayName = user?.name ?? user?.email?.split("@")[0] ?? "Cont AutoMate";
  const roleMeta = user?.role ? USER_ROLE_META[user.role] : null;

  const confirmLogout = () => {
    Alert.alert("Deconectare", "Sigur vrei să te deconectezi?", [
      { text: "Renunță", style: "cancel" },
      { text: "Deconectează-te", style: "destructive", onPress: () => logout() },
    ]);
  };

  return (
    <Screen className="flex-1 bg-bg">
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}>
        <ScreenHeader title="Setări" inset={false} />

        {/* Profil */}
        <AppCard>
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-2xl bg-brand items-center justify-center">
              <User size={22} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="text-ink font-bold text-lg">{displayName}</Text>
              <Text className="text-ink-soft text-sm">{user?.email ?? "—"}</Text>
            </View>
            {roleMeta && <Badge label={roleMeta.label} color={roleMeta.color} />}
          </View>
        </AppCard>

        {/* Preferinte */}
        <AppCard className="py-1">
          <Text className="text-ink-faint text-xs uppercase tracking-wide mt-2">Preferințe</Text>
          <Row
            icon={<Bell size={18} color="#5B8DEF" />}
            label="Notificări"
            value="Remindere RCA, ITP, rovinietă"
            right={<Switch value={notificationsEnabled} onValueChange={(v) => update({ notificationsEnabled: v })} trackColor={{ true: "#5B8DEF" }} />}
          />
          <Row icon={<Palette size={18} color="#A78BFA" />} label="Temă" value={theme === "dark" ? "Întunecat" : theme === "light" ? "Luminos" : "Sistem"} onPress={() => {
            const next = theme === "dark" ? "light" : theme === "light" ? "system" : "dark";
            update({ theme: next });
          }} />
        </AppCard>

        {/* Sectiunea B2B - Echipa & Companie */}
        {(canInvite() || canManageCompany() || canViewFleet()) && (
          <AppCard className="py-1">
            <Text className="text-ink-faint text-xs uppercase tracking-wide mt-2">Companie</Text>
            {canInvite() && (
              <Row
                icon={<Users size={18} color="#34D399" />}
                label="Echipă"
                value="Gestionează utilizatorii companiei"
                onPress={() => router.push("/team")}
              />
            )}
            {canViewFleet() && (
              <Row
                icon={<FileText size={18} color="#22D3EE" />}
                label="Rapoarte"
                value="Rapoarte lunare și per delegație"
                onPress={() => router.push("/reports")}
              />
            )}
          </AppCard>
        )}

        <Pressable onPress={confirmLogout} className="flex-row items-center justify-center gap-2 py-4 rounded-2xl bg-danger/10 border border-danger/30 active:opacity-70">
          <LogOut size={18} color="#F87171" />
          <Text className="text-danger font-semibold">Deconectează-te</Text>
        </Pressable>

        <Text className="text-ink-faint text-xs text-center mt-2">AutoMate v1.0.0 · Made for Romania 🇷🇴</Text>
      </ScrollView>
    </Screen>
  );
}
