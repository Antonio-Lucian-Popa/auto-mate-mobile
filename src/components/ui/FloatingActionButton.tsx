import { Pressable } from "react-native";
import { Plus } from "lucide-react-native";
import * as Haptics from "expo-haptics";

export function FloatingActionButton({ onPress, icon }: { onPress: () => void; icon?: React.ReactNode }) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        onPress();
      }}
      className="absolute bottom-7 right-5 w-14 h-14 rounded-2xl bg-brand items-center justify-center active:bg-brand-soft"
      style={{ shadowColor: "#5B8DEF", shadowOpacity: 0.38, shadowRadius: 14, shadowOffset: { width: 0, height: 7 }, elevation: 7 }}
    >
      {icon ?? <Plus size={28} color="#fff" />}
    </Pressable>
  );
}
