import { View, Text } from "react-native";
import { AppButton } from "./AppButton";
import { colors } from "@/constants/theme";

type Props = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon, title, description, actionLabel, onAction }: Props) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16 gap-3" style={{ backgroundColor: colors.bg }}>
      <View
        className="w-20 h-20 rounded-3xl items-center justify-center mb-2"
        style={{ backgroundColor: colors.card, borderColor: colors.line, borderWidth: 1 }}
      >
        {icon}
      </View>
      <Text className="text-xl font-bold text-center" style={{ color: colors.ink }}>{title}</Text>
      {description && <Text className="text-center leading-5" style={{ color: colors.inkSoft }}>{description}</Text>}
      {actionLabel && onAction && (
        <AppButton title={actionLabel} onPress={onAction} className="mt-4 h-12 px-6 min-w-60" />
      )}
    </View>
  );
}
