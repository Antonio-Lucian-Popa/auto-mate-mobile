import { Tabs } from "expo-router";
import { LayoutDashboard, Car, Bell, Settings } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/theme";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 10);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brandGlow,
        tabBarInactiveTintColor: colors.inkFaint,
        tabBarStyle: {
          backgroundColor: colors.bgSoft,
          borderTopColor: colors.line,
          height: 58 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Acasă", tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> }} />
      <Tabs.Screen name="garage" options={{ title: "Garaj", tabBarIcon: ({ color, size }) => <Car color={color} size={size} /> }} />
      <Tabs.Screen name="reminders" options={{ title: "Reminder-e", tabBarIcon: ({ color, size }) => <Bell color={color} size={size} /> }} />
      <Tabs.Screen name="settings" options={{ title: "Setări", tabBarIcon: ({ color, size }) => <Settings color={color} size={size} /> }} />
    </Tabs>
  );
}
