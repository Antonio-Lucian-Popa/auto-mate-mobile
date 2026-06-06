import { View, Text } from "react-native";

type Props = { label: string; color: string; bg: string; icon?: React.ReactNode };

export function Badge({ label, color, bg, icon }: Props) {
  return (
    <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full self-start" style={{ backgroundColor: bg }}>
      {icon}
      <Text className="text-xs font-semibold" style={{ color }}>{label}</Text>
    </View>
  );
}
