import { View, Text } from "react-native";

type Props = { label: string; color: string; bg?: string; icon?: React.ReactNode; small?: boolean };

export function Badge({ label, color, bg, icon, small }: Props) {
  const background = bg ?? `${color}22`;
  return (
    <View
      className={`flex-row items-center gap-1.5 rounded-full self-start ${small ? "px-2 py-0.5" : "px-2.5 py-1"}`}
      style={{ backgroundColor: background }}
    >
      {icon}
      <Text className={`font-semibold ${small ? "text-[10px]" : "text-xs"}`} style={{ color }}>{label}</Text>
    </View>
  );
}
