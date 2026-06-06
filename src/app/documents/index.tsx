import { useState, useCallback } from "react";
import { View, Text, FlatList, Image, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { FileText, Plus } from "lucide-react-native";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { AppButton } from "@/components/ui/AppButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { useActiveCar } from "@/hooks/useActiveCar";
import { documentsService } from "@/services/documents/documentsService";
import { DOCUMENT_TYPES } from "@/constants";
import { formatDate } from "@/lib/date";
import type { CarDocument } from "@/types";

export default function DocumentsScreen() {
  const { active } = useActiveCar();
  const [docs, setDocs] = useState<CarDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setDocs(await documentsService.list(active?.id));
    setLoading(false);
  }, [active]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const remove = (id: string) => {
    Alert.alert("Șterge document", "Sigur vrei să ștergi acest document?", [
      { text: "Anulează", style: "cancel" },
      { text: "Șterge", style: "destructive", onPress: async () => { await documentsService.remove(id); load(); } },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-5 pt-2">
        <ScreenHeader title="Documente" subtitle={active ? `${active.brand} ${active.model}` : undefined} back
          right={<AppButton title="Adaugă" onPress={() => router.push("/documents/add")} className="h-10 px-4" icon={<Plus size={16} color="#fff" />} />} />

        {loading ? (
          <SkeletonList count={4} />
        ) : docs.length === 0 ? (
          <EmptyState icon={<FileText size={30} color="#22D3EE" />} title="Niciun document" description="Fotografiază RCA, ITP, facturi sau bonuri și ține-le toate într-un singur loc." actionLabel="Adaugă document" onAction={() => router.push("/documents/add")} />
        ) : (
          <FlatList
            data={docs}
            keyExtractor={(i) => i.id}
            numColumns={2}
            columnWrapperStyle={{ gap: 12 }}
            ItemSeparatorComponent={() => <View className="h-3" />}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const typeLabel = DOCUMENT_TYPES.find((t) => t.value === item.type)?.label ?? item.type;
              return (
                <Pressable onLongPress={() => remove(item.id)} className="flex-1 bg-bg-card border border-line rounded-2xl overflow-hidden active:opacity-80">
                  <Image source={{ uri: item.imageUri }} className="w-full h-32" resizeMode="cover" />
                  <View className="p-3 gap-1.5">
                    <Badge label={typeLabel} color="#22D3EE" bg="rgba(34,211,238,0.14)" />
                    <Text className="text-ink font-semibold text-sm" numberOfLines={1}>{item.title}</Text>
                    <Text className="text-ink-faint text-xs">{formatDate(item.createdAt)}</Text>
                  </View>
                </Pressable>
              );
            }}
          />
        )}
        {docs.length > 0 && <Text className="text-ink-faint text-xs text-center mb-2">Apasă lung pe un document pentru a-l șterge.</Text>}
      </View>
    </SafeAreaView>
  );
}
