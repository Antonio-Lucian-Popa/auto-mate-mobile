import { View, Pressable } from "react-native";
import { cn } from "@/lib/cn";

type Props = { children: React.ReactNode; className?: string; onPress?: () => void };

export function AppCard({ children, className, onPress }: Props) {
  const Wrapper: any = onPress ? Pressable : View;
  return (
    <Wrapper
      onPress={onPress}
      className={cn("bg-bg-card border border-line rounded-2xl p-4", onPress && "active:opacity-80", className)}
    >
      {children}
    </Wrapper>
  );
}
