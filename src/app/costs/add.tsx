import { useState } from "react";
import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { AppButton } from "@/components/ui/AppButton";
import { SegmentedField } from "@/components/forms/SegmentedField";
import { EmptyState } from "@/components/ui/EmptyState";
import { useActiveCar } from "@/hooks/useActiveCar";
import { costsService } from "@/services/costs/costsService";
import { COST_CATEGORIES } from "@/constants";
import { todayISO } from "@/lib/date";
import { CarFront } from "lucide-react-native";
import type { CostCategory } from "@/types";

export default function AddCostScreen() {
  const { active, options, isLoading } = useActiveCar();
  const [carId, setCarId] = useState<string | undefined>(active?.id);
  const [category, setCategory] = useState<CostCategory>("SERVICE");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [mileage, setMileage] = useState("");
  const [vendor, setVendor] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const carValue = carId ?? active?.id;

  if (!isLoading && options.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-bg">
        <View className="px-5 pt-2"><ScreenHeader title="Cost nou" back /></View>
        <EmptyState icon={<CarFront size={30} color="#FBBF24" />} title="Nicio mașină" description="Adaugă o mașină pentru a înregistra costuri." actionLabel="Adaugă mașină" onAction={() => router.replace("/car/add")} />
      </SafeAreaView>
    );
  }

  const save = async () => {
    if (!carValue) { Alert.alert("Selectează o mașină"); return; }
    const amountN = Number(amount.replace(",", "."));
    if (!amountN) { Alert.alert("Sumă lipsă", "Completează suma cheltuită."); return; }
    setSaving(true);
    try {
      await costsService.create({
        carId: carValue, category, amount: amountN, currency: "RON",
        date, mileage: mileage ? Number(mileage) : undefined,
        vendor: vendor.trim() || undefined, notes: notes.trim() || undefined,
      });
      router.replace("/costs");
    } catch { Alert.alert("Eroare", "Nu am putut salva costul."); }
    finally { setSaving(false); }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <ScreenHeader title="Cost nou" subtitle="Adaugă o cheltuială pentru mașină" back />

          {options.length > 1 && <SegmentedField label="Mașină" options={options} value={carValue ?? ""} onChange={setCarId} />}
          <SegmentedField label="Categorie" options={COST_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))} value={category} onChange={(v) => setCategory(v as CostCategory)} />

          <AppTextInput label="Sumă (RON)" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="450" />
          <View className="flex-row gap-3">
            <View className="flex-1"><AppTextInput label="Data" value={date} onChangeText={setDate} placeholder="2026-06-01" autoCapitalize="none" /></View>
            <View className="flex-1"><AppTextInput label="Km la bord" value={mileage} onChangeText={setMileage} keyboardType="number-pad" placeholder="184320" /></View>
          </View>
          <AppTextInput label="Furnizor (opțional)" value={vendor} onChangeText={setVendor} placeholder="ex: Service Auto Vrancea" />
          <AppTextInput label="Note (opțional)" value={notes} onChangeText={setNotes} placeholder="Detalii" multiline />

          <AppButton title="Salvează costul" onPress={save} loading={saving} className="mt-1" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
