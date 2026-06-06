import { Pressable, Text, ActivityIndicator, View } from "react-native";
import * as Haptics from "expo-haptics";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
};

const styles: Record<Variant, { bg: string; text: string }> = {
  primary: { bg: "bg-brand active:bg-brand-soft", text: "text-white" },
  secondary: { bg: "bg-bg-elevated border border-line active:opacity-80", text: "text-ink" },
  ghost: { bg: "bg-transparent active:bg-bg-soft", text: "text-ink-soft" },
  danger: { bg: "bg-danger/15 border border-danger/30 active:bg-danger/25", text: "text-danger" },
};

export function AppButton({ title, onPress, variant = "primary", loading, disabled, icon, className }: Props) {
  const s = styles[variant];
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={() => {
        if (isDisabled) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress?.();
      }}
      className={cn(
        "h-14 rounded-2xl items-center justify-center flex-row px-5",
        s.bg,
        isDisabled && "opacity-50",
        className
      )}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#fff" : "#AEB8D0"} />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon}
          <Text className={cn("text-base font-semibold", s.text)}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}
