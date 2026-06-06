import { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronDown, ChevronUp, Check, X } from "lucide-react-native";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { SegmentedField } from "@/components/forms/SegmentedField";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import { ReceiptReviewCard } from "@/components/cards/ReceiptReviewCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useActiveCar } from "@/hooks/useActiveCar";
import { fuelService } from "@/services/fuel/fuelService";
import { costsService } from "@/services/costs/costsService";
import { FUEL_TYPES } from "@/constants";
import { todayISO } from "@/lib/date";
import { parseNumberInput } from "@/lib/format";
import type { ParsedReceipt } from "@/services/receipts/receiptParser";
import type { FuelType } from "@/types";

type Conf = "high" | "medium" | "low";

const FUEL_MAP: Record<string, FuelType> = { benzina: "benzina", motorina: "motorina", gpl: "gpl", electric: "electric" };

function Field({ label, level, value, onChangeText, keyboardType, placeholder }: {
  label: string; level: Conf; value: string; onChangeText: (t: string) => void;
  keyboardType?: "number-pad" | "decimal-pad" | "default"; placeholder?: string;
}) {
  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-ink-soft text-sm font-medium">{label}</Text>
        <ConfidenceBadge level={level} />
      </View>
      <AppTextInput value={value} onChangeText={onChangeText} keyboardType={keyboardType} placeholder={placeholder} autoCapitalize="none" />
    </View>
  );
}

export default function ReceiptReviewScreen() {
  const { data } = useLocalSearchParams<{ data: string }>();
  const parsed = useMemo<ParsedReceipt | null>(() => {
    try { return JSON.parse(decodeURIComponent(data)); } catch { return null; }
  }, [data]);

  const { active, options } = useActiveCar();
  const [carId, setCarId] = useState<string | undefined>(active?.id);
  const [showRaw, setShowRaw] = useState(false);
  const [saving, setSaving] = useState(false);

  const [merchant, setMerchant] = useState(parsed?.merchant ?? "");
  const [date, setDate] = useState(parsed?.date ?? todayISO());
  const [fuelType, setFuelType] = useState<FuelType>(FUEL_MAP[parsed?.fuelType ?? ""] ?? "motorina");
  const [liters, setLiters] = useState(parsed?.liters != null ? String(parsed.liters) : "");
  const [ppl, setPpl] = useState(parsed?.pricePerLiter != null ? String(parsed.pricePerLiter) : "");
  const [total, setTotal] = useState(parsed?.total != null ? String(parsed.total) : "");
  const [mileage, setMileage] = useState("");
  const [alsoCost, setAlsoCost] = useState(true);

  if (!parsed) {
    return (
      <Screen className="flex-1 bg-bg">
        <View className="px-5 pt-2"><ScreenHeader title="Bon scanat" back /></View>
        <EmptyState title="Date indisponibile" description="Nu am putut citi bonul. Încearcă din nou." actionLabel="Înapoi la scanare" onAction={() => router.replace("/receipts/scan")} />
      </Screen>
    );
  }

  const c = parsed.confidence;
  const carValue = carId ?? active?.id;

  const save = async () => {
    if (!carValue) { Alert.alert("Selectează o mașină", "Adaugă întâi o mașină în garaj."); return; }
    const litersN = parseNumberInput(liters) ?? 0;
    const pplN = parseNumberInput(ppl) ?? 0;
    const totalN = parseNumberInput(total) ?? 0;
    const mileageN = parseNumberInput(mileage);
    if (!totalN) { Alert.alert("Total lipsă", "Completează valoarea totală a bonului."); return; }

    setSaving(true);
    try {
      await fuelService.create({
        carId: carValue,
        date: date || todayISO(),
        station: merchant || undefined,
        fuelType,
        liters: litersN || 0,
        pricePerLiter: pplN || 0,
        total: totalN,
        mileage: mileageN,
        fullTank: true,
        receiptImageUri: parsed.sourceImageUri,
      });
      if (alsoCost) {
        await costsService.create({
          carId: carValue,
          category: "FUEL",
          amount: totalN,
          currency: "RON",
          date: date || todayISO(),
          mileage: mileageN,
          vendor: merchant || undefined,
          notes: "Adăugat din bon scanat",
          receiptImageUri: parsed.sourceImageUri,
        });
      }
      Alert.alert("Bon adăugat", "Alimentarea a fost salvată cu succes.", [
        { text: "OK", onPress: () => router.replace("/fuel") },
      ]);
    } catch {
      Alert.alert("Eroare", "Nu am putut salva bonul.");
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    Alert.alert("Renunți la bon?", "Datele scanate nu vor fi salvate.", [
      { text: "Continuă editarea", style: "cancel" },
      { text: "Renunță", style: "destructive", onPress: () => router.back() },
    ]);
  };

  return (
    <Screen className="flex-1 bg-bg">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <ScreenHeader title="Bon scanat" subtitle="Vrei să adaugi acest bon în aplicație?" back />

          <ReceiptReviewCard merchant={merchant} total={parseNumberInput(total)} confidenceTotal={c.total} confidenceMerchant={c.merchant} />

          {options.length > 1 && (
            <SegmentedField label="Mașină" options={options} value={carValue ?? ""} onChange={setCarId} />
          )}

          <Field label="Stație" level={c.merchant} value={merchant} onChangeText={setMerchant} placeholder="ex: OMV" />
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-ink-soft text-sm font-medium">Data</Text>
              <ConfidenceBadge level={c.date} />
            </View>
            <DatePickerField value={date} onChange={setDate} />
          </View>

          <View className="gap-2">
            <Text className="text-ink-soft text-sm font-medium">Tip combustibil</Text>
            <SegmentedField options={FUEL_TYPES.filter((f) => f.value !== "hybrid")} value={fuelType} onChange={(v) => setFuelType(v as FuelType)} />
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1"><Field label="Litri" level={c.liters} value={liters} onChangeText={setLiters} keyboardType="decimal-pad" placeholder="42.5" /></View>
            <View className="flex-1"><Field label="Preț / litru" level={c.pricePerLiter} value={ppl} onChangeText={setPpl} keyboardType="decimal-pad" placeholder="7.45" /></View>
          </View>

          <Field label="Total (RON)" level={c.total} value={total} onChangeText={setTotal} keyboardType="decimal-pad" placeholder="316.62" />

          <AppTextInput label="Km la bord (opțional)" value={mileage} onChangeText={setMileage} keyboardType="number-pad" placeholder="184320" />

          <Pressable onPress={() => setAlsoCost((v) => !v)} className="flex-row items-center gap-3 active:opacity-70">
            <View className={`w-6 h-6 rounded-lg items-center justify-center border ${alsoCost ? "bg-brand border-brand" : "bg-bg-soft border-line"}`}>
              {alsoCost && <Check size={16} color="#fff" />}
            </View>
            <Text className="text-ink-soft flex-1">Adaugă și ca cost „Carburant"</Text>
          </Pressable>

          <Pressable onPress={() => setShowRaw((v) => !v)} className="flex-row items-center justify-between bg-bg-soft border border-line rounded-2xl px-4 h-12 active:opacity-70">
            <Text className="text-ink-soft text-sm">Text brut OCR</Text>
            {showRaw ? <ChevronUp size={18} color="#AEB8D0" /> : <ChevronDown size={18} color="#AEB8D0" />}
          </Pressable>
          {showRaw && (
            <AppCard><Text className="text-ink-faint text-xs leading-5" selectable>{parsed.rawText || "—"}</Text></AppCard>
          )}

          <AppButton title="Adaugă bonul" icon={<Check size={20} color="#fff" />} onPress={save} loading={saving} className="mt-1" />
          <AppButton title="Renunță" variant="danger" icon={<X size={18} color="#F87171" />} onPress={discard} />

          <Text className="text-ink-faint text-xs text-center px-4">
            Nimic nu se salvează automat — datele sunt adăugate doar când apeși „Adaugă bonul".
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
