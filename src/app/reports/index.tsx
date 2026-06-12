import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, Linking } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/Skeleton";
import { useReports, useGenerateMonthlyReport } from "@/hooks/useReports";
import { reportsApi } from "@/services/api/reports";
import { API_BASE_URL } from "@/services/api/client";
import { formatDate } from "@/lib/date";
import { FileText, Download, Send, Plus } from "lucide-react-native";
import { router } from "expo-router";

export default function ReportsScreen() {
  const { data: reports, isLoading, refetch } = useReports();
  const generateMonthly = useGenerateMonthlyReport();
  const [generating, setGenerating] = useState(false);

  const handleGenerateMonthly = () => {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    Alert.alert(
      "Raport lunar",
      `Generează raport pentru ${month}?`,
      [
        { text: "Anulează", style: "cancel" },
        {
          text: "Generează",
          onPress: async () => {
            setGenerating(true);
            try {
              await generateMonthly.mutateAsync({ month });
            } catch (e: any) {
              Alert.alert("Eroare", e.message);
            } finally {
              setGenerating(false);
            }
          },
        },
      ],
    );
  };

  const handleDownload = async (id: string) => {
    try {
      const { url } = await reportsApi.download(id);
      const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
      await Linking.openURL(fullUrl);
    } catch (e: any) {
      Alert.alert("Eroare", e.message);
    }
  };

  const handleSend = async (id: string) => {
    try {
      await reportsApi.send(id);
      Alert.alert("Trimis", "Raportul a fost trimis pe email.");
    } catch (e: any) {
      Alert.alert("Eroare", e.message);
    }
  };

  return (
    <Screen className="flex-1 bg-bg">
      <ScreenHeader title="Rapoarte" />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}>
        <AppButton
          title="Generează raport lunar"
          onPress={handleGenerateMonthly}
          loading={generating || generateMonthly.isPending}
          icon={<Plus size={18} color="#fff" />}
        />

        {isLoading ? (
          <SkeletonList count={3} />
        ) : !reports?.length ? (
          <EmptyState
            icon={<FileText size={32} color="#7FA8FF" />}
            title="Niciun raport"
            description="Generează primul tău raport lunar sau dintr-o delegație."
          />
        ) : (
          <View className="gap-3">
            {reports.map((report) => (
              <AppCard key={report.id}>
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text className="text-ink font-semibold">{report.title}</Text>
                    <Text className="text-ink-soft text-sm mt-1">{formatDate(report.createdAt)}</Text>
                    <Text className="text-ink-soft text-xs mt-0.5">{report.type === "TRIP" ? "Raport delegație" : "Raport lunar"}</Text>
                  </View>
                  <View className="flex-row gap-3 mt-1">
                    <TouchableOpacity onPress={() => handleDownload(report.id)}>
                      <Download size={20} color="#5B8DEF" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleSend(report.id)}>
                      <Send size={20} color="#34D399" />
                    </TouchableOpacity>
                  </View>
                </View>
              </AppCard>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
