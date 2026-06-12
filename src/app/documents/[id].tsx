import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, Linking, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import { ExternalLink, FileText } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { AppButton } from "@/components/ui/AppButton";
import { formatDate } from "@/lib/date";

function paramValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value ?? "";
}

function isPdf(uri: string, mimeType: string) {
  const lower = uri.toLowerCase();
  return mimeType === "application/pdf" || lower.includes(".pdf") || lower.includes("application%2Fpdf");
}

export default function DocumentPreviewScreen() {
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const title = paramValue(params.title) || "Document";
  const type = paramValue(params.type);
  const uri = paramValue(params.uri);
  const mimeType = paramValue(params.mimeType);
  const createdAt = paramValue(params.createdAt);
  const pdf = isPdf(uri, mimeType);

  const viewerUri = useMemo(() => {
    if (!pdf) return uri;
    return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(uri)}`;
  }, [pdf, uri]);

  const openExternal = async () => {
    try {
      await Linking.openURL(uri);
    } catch {
      Alert.alert("Nu pot deschide documentul", "Linkul documentului nu este disponibil.");
    }
  };

  return (
    <Screen className="flex-1 bg-bg">
      <View className="flex-1 px-5 pt-2">
        <ScreenHeader title={title} subtitle={[type, createdAt ? formatDate(createdAt) : ""].filter(Boolean).join(" • ")} back inset={false} />

        <View className="flex-1 overflow-hidden rounded-2xl border border-line bg-bg-card">
          {!uri || failed ? (
            <View className="flex-1 items-center justify-center px-6">
              <FileText size={42} color="#22D3EE" />
              <Text className="mt-3 text-center text-ink font-semibold">Documentul nu poate fi afișat</Text>
              <Text className="mt-2 text-center text-ink-faint text-sm">
                Verifică dacă linkul este public și dacă fișierul există pe server.
              </Text>
            </View>
          ) : pdf ? (
            <>
              {loading && (
                <View className="absolute inset-0 z-10 items-center justify-center bg-bg-card">
                  <ActivityIndicator color="#7FA8FF" />
                  <Text className="mt-3 text-ink-faint text-sm">Se încarcă PDF-ul...</Text>
                </View>
              )}
              <WebView
                source={{ uri: viewerUri }}
                className="flex-1 bg-white"
                startInLoadingState
                onLoadEnd={() => setLoading(false)}
                onError={() => {
                  setLoading(false);
                  setFailed(true);
                }}
              />
            </>
          ) : (
            <Image source={{ uri }} className="h-full w-full bg-bg-soft" resizeMode="contain" onError={() => setFailed(true)} />
          )}
        </View>

        <AppButton
          title="Deschide extern"
          variant="secondary"
          icon={<ExternalLink size={18} color="#F4F7FF" />}
          onPress={openExternal}
          className="mt-4 mb-3"
        />
      </View>
    </Screen>
  );
}
