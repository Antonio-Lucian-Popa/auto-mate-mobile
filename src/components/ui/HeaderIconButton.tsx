import { Pressable } from "react-native";
import * as Haptics from "expo-haptics";

type Props = {
  icon: React.ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
};

export function HeaderIconButton({ icon, onPress, accessibilityLabel }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress();
      }}
      className="w-10 h-10 rounded-xl bg-brand/15 border border-brand/30 items-center justify-center active:bg-brand/25"
    >
      {icon}
    </Pressable>
  );
}
