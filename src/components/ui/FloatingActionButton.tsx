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
      className="absolute bottom-6 right-5 w-16 h-16 rounded-3xl bg-brand items-center justify-center active:bg-brand-soft"
      style={{ shadowColor: "#5B8DEF", shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 }}
    >
      {icon ?? <Plus size={28} color="#fff" />}
    </Pressable>
  );
}
