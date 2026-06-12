import { View, Pressable, type ViewStyle } from "react-native";
import { cn } from "@/lib/cn";

type Props = { children: React.ReactNode; className?: string; onPress?: () => void; style?: ViewStyle };

export function AppCard({ children, className, onPress, style }: Props) {
  const Wrapper: any = onPress ? Pressable : View;
  return (
    <Wrapper
      onPress={onPress}
      style={style}
      className={cn("bg-bg-card border border-line rounded-2xl p-4", onPress && "active:opacity-80", className)}
    >
      {children}
    </Wrapper>
  );
}
