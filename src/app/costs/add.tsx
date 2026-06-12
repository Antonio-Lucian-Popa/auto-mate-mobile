import { useRef, useState } from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { router } from "expo-router";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { AppButton } from "@/components/ui/AppButton";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { SegmentedField } from "@/components/forms/SegmentedField";
import { EmptyState } from "@/components/ui/EmptyState";
import { useActiveCar } from "@/hooks/useActiveCar";
import { costsService } from "@/services/costs/costsService";
import { COST_CATEGORIES } from "@/constants";
import { todayISO } from "@/lib/date";
import { normalizeNumberInput, parseNumberInput } from "@/lib/format";
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
  const numberValuesRef = useRef({ amount: "", mileage: "" });

  const carValue = carId ?? active?.id;

  const updateAmount = (value: string) => {
    const next = normalizeNumberInput(value);
    numberValuesRef.current.amount = next;
    setAmount(next);
  };

  const updateMileage = (value: string) => {
    const next = normalizeNumberInput(value, false);
    numberValuesRef.current.mileage = next;
    setMileage(next);
  };

  if (!isLoading && options.length === 0) {
    return (
      <Screen className="flex-1 bg-bg">
        <View className="px-5 pt-2"><ScreenHeader title="Cost nou" back inset={false} /></View>
        <EmptyState icon={<CarFront size={30} color="#FBBF24" />} title="Nicio mașină" description="Adaugă o mașină pentru a înregistra costuri." actionLabel="Adaugă mașină" onAction={() => router.replace("/car/add")} />
      </Screen>
    );
  }

  const save = async () => {
    if (!carValue) { Alert.alert("Selectează o mașină"); return; }
    const latest = numberValuesRef.current;
    const amountN = parseNumberInput(latest.amount) ?? 0;
    const mileageN = parseNumberInput(latest.mileage);
    if (amountN <= 0) {
      Alert.alert("Sumă lipsă", `Completează suma cheltuită.\n\nAplicația citește acum: Sumă="${latest.amount || "-"}".`);
      return;
    }
    setSaving(true);
    try {
      await costsService.create({
        carId: carValue, category, amount: amountN, currency: "RON",
        date, mileage: mileageN,
        vendor: vendor.trim() || undefined, notes: notes.trim() || undefined,
      });
      router.replace("/costs");
    } catch { Alert.alert("Eroare", "Nu am putut salva costul."); }
    finally { setSaving(false); }
  };

  return (
    <Screen className="flex-1 bg-bg">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <ScreenHeader title="Cost nou" subtitle="Adaugă o cheltuială pentru mașină" back inset={false} />

          {options.length > 1 && <SegmentedField label="Mașină" options={options} value={carValue ?? ""} onChange={setCarId} />}
          <SegmentedField label="Categorie" options={COST_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))} value={category} onChange={(v) => setCategory(v as CostCategory)} />

          <AppTextInput label="Sumă (RON)" value={amount} onChangeText={updateAmount} keyboardType="decimal-pad" placeholder="450" />
          <View className="flex-row gap-3">
            <View className="flex-1"><DatePickerField label="Data" value={date} onChange={setDate} /></View>
            <View className="flex-1"><AppTextInput label="Km la bord" value={mileage} onChangeText={updateMileage} keyboardType="number-pad" placeholder="184320" /></View>
          </View>
          <AppTextInput label="Furnizor (opțional)" value={vendor} onChangeText={setVendor} placeholder="ex: Service Auto Vrancea" />
          <AppTextInput label="Note (opțional)" value={notes} onChangeText={setNotes} placeholder="Detalii" multiline />

          <AppButton title="Salvează costul" onPress={save} loading={saving} className="mt-1" />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
