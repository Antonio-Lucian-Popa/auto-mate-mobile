import { useEffect } from "react";
import { View } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from "react-native-reanimated";

export function Skeleton({ height = 80, className = "" }: { height?: number; className?: string }) {
  const o = useSharedValue(0.4);
  useEffect(() => {
    o.value = withRepeat(withTiming(0.9, { duration: 800 }), -1, true);
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: o.value }));
  return (
    <Animated.View style={style}>
      <View className={`bg-bg-card rounded-2xl ${className}`} style={{ height }} />
    </Animated.View>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <View className="gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} />
      ))}
    </View>
  );
}
