import { useState, useCallback } from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { router } from "expo-router";
import { Camera, ImageIcon, ScanLine } from "lucide-react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { pickFromCamera, pickFromLibrary } from "@/hooks/useImagePicker";
import { extractTextFromReceiptImage } from "@/services/ocr/ocrService";
import { parseReceipt } from "@/services/receipts/receiptParser";

export default function ScanReceiptScreen() {
  const [busy, setBusy] = useState(false);

  const run = useCallback(async (uri: string | null) => {
    if (!uri) return;
    setBusy(true);
    try {
      const ocr = await extractTextFromReceiptImage(uri);
      const parsed = parseReceipt(ocr.rawText);
      const payload = encodeURIComponent(JSON.stringify({ ...parsed, sourceImageUri: ocr.sourceImageUri ?? uri }));
      router.replace({ pathname: "/receipts/review", params: { data: payload } });
    } catch (e: any) {
      Alert.alert("OCR indisponibil", e?.message ?? "Nu am putut citi textul de pe bon. Încearcă o poză mai clară.");
    } finally {
      setBusy(false);
    }
  }, []);

  if (busy) {
    return (
      <Screen className="flex-1 bg-bg items-center justify-center px-10">
        <Animated.View entering={FadeIn} className="items-center gap-5">
          <View className="w-24 h-24 rounded-3xl bg-brand/15 border border-brand/30 items-center justify-center">
            <ScanLine size={40} color="#5B8DEF" />
          </View>
          <ActivityIndicator color="#5B8DEF" />
          <View className="items-center gap-1">
            <Text className="text-ink text-xl font-bold">Scanăm bonul…</Text>
            <Text className="text-ink-soft text-center leading-5">
              Citim textul offline, direct pe telefonul tău. Nimic nu pleacă în cloud.
            </Text>
          </View>
        </Animated.View>
      </Screen>
    );
  }

  return (
    <Screen className="flex-1 bg-bg">
      <View className="flex-1 px-5 pt-2">
        <ScreenHeader title="Scanează bon" subtitle="OCR offline pentru bonuri de carburant" back />

        <AppCard className="items-center py-8 mb-6">
          <View className="w-20 h-20 rounded-3xl bg-brand/15 border border-brand/30 items-center justify-center mb-4">
            <ScanLine size={36} color="#5B8DEF" />
          </View>
          <Text className="text-ink text-lg font-bold text-center">Fotografiază bonul</Text>
          <Text className="text-ink-soft text-center leading-5 mt-1">
            Detectăm automat stația, data, litrii, prețul și totalul. Verifici totul înainte de salvare.
          </Text>
        </AppCard>

        <AppButton title="Deschide camera" icon={<Camera size={20} color="#fff" />} onPress={async () => run(await pickFromCamera())} className="mb-3" />
        <AppButton title="Alege din galerie" variant="secondary" icon={<ImageIcon size={20} color="#F4F7FF" />} onPress={async () => run(await pickFromLibrary())} />

        <Text className="text-ink-faint text-xs text-center mt-auto mb-2 px-4">
          OCR-ul rulează local pe telefon. Imaginea bonului rămâne pe dispozitivul tău.
        </Text>
      </View>
    </Screen>
  );
}
