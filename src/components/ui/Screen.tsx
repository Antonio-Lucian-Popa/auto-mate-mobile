import { PropsWithChildren } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Edge } from "react-native-safe-area-context";
import { cn } from "@/lib/cn";
import { colors } from "@/constants/theme";

type Props = PropsWithChildren<{
  className?: string;
  style?: StyleProp<ViewStyle>;
  edges?: Edge[];
}>;

const DEFAULT_EDGES: Edge[] = ["top", "left", "right"];

export function Screen({ children, className, style, edges = DEFAULT_EDGES }: Props) {
  return (
    <SafeAreaView
      edges={edges}
      className={cn("flex-1 bg-bg", className)}
      style={[{ flex: 1, backgroundColor: colors.bg }, style]}
    >
      {children}
    </SafeAreaView>
  );
}
