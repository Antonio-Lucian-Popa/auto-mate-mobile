import { useRef, useState } from "react";
import { View, Text, ScrollView, Pressable, Image, Alert } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { router } from "expo-router";
import { Camera, ImageIcon, FileText, CarFront, Upload } from "lucide-react-native";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { SegmentedField } from "@/components/forms/SegmentedField";
import { EmptyState } from "@/components/ui/EmptyState";
import { useActiveCar } from "@/hooks/useActiveCar";
import { documentsService } from "@/services/documents/documentsService";
import { pickDocumentFile, pickImageFromCamera, pickImageFromLibrary, type PickedFile } from "@/hooks/useImagePicker";
import { DOCUMENT_TYPES } from "@/constants";
import type { DocumentType } from "@/types";

export default function AddDocumentScreen() {
  const { active, options, isLoading } = useActiveCar();
  const [carId, setCarId] = useState<string | undefined>(active?.id);
  const [type, setType] = useState<DocumentType>("RCA");
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<PickedFile | null>(null);
  const [saving, setSaving] = useState(false);
  const selectedFileRef = useRef<PickedFile | null>(null);

  const carValue = carId ?? active?.id;

  const updateSelectedFile = (file: PickedFile | null) => {
    selectedFileRef.current = file;
    setSelectedFile(file);
  };

  const pickFile = async () => {
    try {
      updateSelectedFile(await pickDocumentFile());
    } catch (error) {
      Alert.alert("PDF indisponibil", error instanceof Error ? error.message : "Rebuild/reinstalează aplicația Android pentru a activa încărcarea PDF.");
    }
  };

  if (!isLoading && options.length === 0) {
    return (
      <Screen className="flex-1 bg-bg">
        <View className="px-5 pt-2"><ScreenHeader title="Document nou" back inset={false} /></View>
        <EmptyState icon={<CarFront size={30} color="#22D3EE" />} title="Nicio mașină" description="Adaugă o mașină pentru a atașa documente." actionLabel="Adaugă mașină" onAction={() => router.replace("/car/add")} />
      </Screen>
    );
  }

  const save = async () => {
    if (!carValue) { Alert.alert("Selectează o mașină"); return; }
    const file = selectedFileRef.current;
    if (!file) { Alert.alert("Adaugă documentul", "Fotografiază, alege o poză sau încarcă un PDF."); return; }
    const typeLabel = DOCUMENT_TYPES.find((t) => t.value === type)?.label ?? type;
    setSaving(true);
    try {
      await documentsService.create({
        carId: carValue,
        type,
        title: title.trim() || typeLabel,
        imageUri: file.uri,
        mimeType: file.mimeType,
        fileName: file.name,
      });
      router.replace("/documents");
    } catch { Alert.alert("Eroare", "Nu am putut salva documentul."); }
    finally { setSaving(false); }
  };

  return (
    <Screen className="flex-1 bg-bg">
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="Document nou" subtitle="Atașează RCA, ITP, factură sau bon" back inset={false} />

        <Pressable
          onPress={pickFile}
          className="active:opacity-80"
        >
          {selectedFile?.kind === "image" ? (
            <Image source={{ uri: selectedFile.uri }} className="w-full h-56 rounded-2xl" resizeMode="cover" />
          ) : selectedFile ? (
            <AppCard className="items-center py-10">
              <View className="w-16 h-16 rounded-3xl bg-bg-soft items-center justify-center mb-3"><FileText size={28} color="#22D3EE" /></View>
              <Text className="text-ink font-semibold" numberOfLines={1}>{selectedFile.name ?? "Document PDF"}</Text>
              <Text className="text-ink-faint text-xs mt-1">PDF pregătit pentru încărcare</Text>
            </AppCard>
          ) : (
            <AppCard className="items-center py-10 border-dashed">
              <View className="w-16 h-16 rounded-3xl bg-bg-soft items-center justify-center mb-3"><FileText size={28} color="#22D3EE" /></View>
              <Text className="text-ink font-semibold">Atașează documentul</Text>
              <Text className="text-ink-faint text-xs mt-1">poză sau PDF</Text>
            </AppCard>
          )}
        </Pressable>

        <View className="flex-row gap-3">
          <View className="flex-1"><AppButton title="Camera" variant="secondary" icon={<Camera size={18} color="#F4F7FF" />} onPress={async () => updateSelectedFile(await pickImageFromCamera())} /></View>
          <View className="flex-1"><AppButton title="Galerie" variant="secondary" icon={<ImageIcon size={18} color="#F4F7FF" />} onPress={async () => updateSelectedFile(await pickImageFromLibrary())} /></View>
        </View>

        <AppButton title="Fișier / PDF" variant="secondary" icon={<Upload size={18} color="#F4F7FF" />} onPress={pickFile} />

        {selectedFile && (
          <Text className="text-ink-faint text-xs px-1">
            Selectat: {selectedFile.name ?? (selectedFile.kind === "pdf" ? "document.pdf" : "document.jpg")}
          </Text>
        )}

        {options.length > 1 && <SegmentedField label="Mașină" options={options} value={carValue ?? ""} onChange={setCarId} />}
        <SegmentedField label="Tip document" options={DOCUMENT_TYPES.map((t) => ({ value: t.value, label: t.label }))} value={type} onChange={(v) => setType(v as DocumentType)} />
        <AppTextInput label="Titlu (opțional)" value={title} onChangeText={setTitle} placeholder="ex: RCA Allianz 2026" />

        <AppButton title="Salvează documentul" onPress={save} loading={saving} className="mt-1" />
      </ScrollView>
    </Screen>
  );
}
