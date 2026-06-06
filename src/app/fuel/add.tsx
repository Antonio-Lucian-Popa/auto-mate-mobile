import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { router } from "expo-router";
import { Check, ScanLine, CarFront } from "lucide-react-native";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { AppButton } from "@/components/ui/AppButton";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { SegmentedField } from "@/components/forms/SegmentedField";
import { EmptyState } from "@/components/ui/EmptyState";
import { useActiveCar } from "@/hooks/useActiveCar";
import { fuelService } from "@/services/fuel/fuelService";
import { FUEL_TYPES, FUEL_STATIONS } from "@/constants";
import { todayISO } from "@/lib/date";
import { formatRON, normalizeNumberInput, parseNumberInput } from "@/lib/format";
import type { FuelType } from "@/types";

export default function AddFuelScreen() {
  const { active, options, isLoading } = useActiveCar();
  const [carId, setCarId] = useState<string | undefined>(active?.id);
  const [station, setStation] = useState(FUEL_STATIONS[0]);
  const [fuelType, setFuelType] = useState<FuelType>(active?.fuelType ?? "motorina");
  const [date, setDate] = useState(todayISO());
  const [liters, setLiters] = useState("");
  const [ppl, setPpl] = useState("");
  const [total, setTotal] = useState("");
  const [mileage, setMileage] = useState("");
  const [fullTank, setFullTank] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fuelInputError, setFuelInputError] = useState<string | undefined>();

  // total auto-calculat din litri × pret
  useEffect(() => {
    const l = parseNumberInput(liters) ?? 0;
    const p = parseNumberInput(ppl) ?? 0;
    if (l > 0 && p > 0) setTotal((Math.round(l * p * 100) / 100).toString());
  }, [liters, ppl]);

  const carValue = carId ?? active?.id;
  const hasFuelValues = (parseNumberInput(total) ?? 0) > 0 || (parseNumberInput(liters) ?? 0) > 0;
  const visibleFuelInputError = fuelInputError && !hasFuelValues ? fuelInputError : undefined;

  if (!isLoading && options.length === 0) {
    return (
      <Screen className="flex-1 bg-bg">
        <View className="px-5 pt-2"><ScreenHeader title="Alimentare nouă" back /></View>
        <EmptyState icon={<CarFront size={30} color="#34D399" />} title="Nicio mașină" description="Adaugă o mașină pentru a înregistra alimentări." actionLabel="Adaugă mașină" onAction={() => router.replace("/car/add")} />
      </Screen>
    );
  }

  const save = async () => {
    if (!carValue) { Alert.alert("Selectează o mașină"); return; }
    const totalN = parseNumberInput(total) ?? 0;
    const litersN = parseNumberInput(liters) ?? 0;
    const pplN = parseNumberInput(ppl) ?? 0;
    const resolvedTotal = totalN > 0 ? totalN : litersN > 0 && pplN > 0 ? Math.round(litersN * pplN * 100) / 100 : 0;
    const mileageN = parseNumberInput(mileage);
    if (resolvedTotal <= 0 && litersN <= 0) {
      setFuelInputError("Completează Litri sau Total (RON).");
      Alert.alert(
        "Date insuficiente",
        `Completează Litri sau Total (RON).\n\nAplicația citește acum: Litri="${liters || "-"}", Total="${total || "-"}".`
      );
      return;
    }
    setFuelInputError(undefined);
    setSaving(true);
    try {
      await fuelService.create({
        carId: carValue, date, station,
        fuelType, liters: litersN || 0,
        pricePerLiter: pplN || 0,
        total: resolvedTotal,
        mileage: mileageN,
        fullTank,
      });
      router.replace("/fuel");
    } catch { Alert.alert("Eroare", "Nu am putut salva alimentarea."); }
    finally { setSaving(false); }
  };

  return (
    <Screen className="flex-1 bg-bg">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <ScreenHeader title="Alimentare nouă" subtitle="Înregistrează o plină de carburant" back
            right={<Pressable onPress={() => router.push("/receipts/scan")} className="flex-row items-center gap-1.5 bg-brand/15 border border-brand/30 px-3 h-9 rounded-xl active:opacity-70">
              <ScanLine size={16} color="#5B8DEF" /><Text className="text-brand-glow text-sm font-medium">Scan</Text>
            </Pressable>} />

          {options.length > 1 && <SegmentedField label="Mașină" options={options} value={carValue ?? ""} onChange={setCarId} />}
          <SegmentedField label="Stație" options={FUEL_STATIONS.map((s) => ({ value: s, label: s }))} value={station} onChange={setStation} />
          <SegmentedField label="Combustibil" options={FUEL_TYPES.filter((f) => f.value !== "hybrid")} value={fuelType} onChange={(v) => setFuelType(v as FuelType)} />

          <View className="flex-row gap-3">
            <View className="flex-1"><AppTextInput label="Litri" value={liters} onChangeText={(value) => { setFuelInputError(undefined); setLiters(normalizeNumberInput(value)); }} keyboardType="decimal-pad" placeholder="42.5" error={visibleFuelInputError} /></View>
            <View className="flex-1"><AppTextInput label="Preț / litru" value={ppl} onChangeText={(value) => setPpl(normalizeNumberInput(value))} keyboardType="decimal-pad" placeholder="7.45" /></View>
          </View>

          <AppTextInput label="Total (RON)" value={total} onChangeText={(value) => { setFuelInputError(undefined); setTotal(normalizeNumberInput(value)); }} keyboardType="decimal-pad" placeholder="auto-calculat" error={visibleFuelInputError} />
          {(parseNumberInput(total) ?? 0) > 0 && <Text className="text-ink-faint text-xs -mt-2 px-1">Total: {formatRON(parseNumberInput(total))}</Text>}

          <View className="flex-row gap-3">
            <View className="flex-1"><DatePickerField label="Data" value={date} onChange={setDate} /></View>
            <View className="flex-1"><AppTextInput label="Km la bord" value={mileage} onChangeText={(value) => setMileage(normalizeNumberInput(value, false))} keyboardType="number-pad" placeholder="184320" /></View>
          </View>

          <Pressable onPress={() => setFullTank((v) => !v)} className="flex-row items-center gap-3 active:opacity-70">
            <View className={`w-6 h-6 rounded-lg items-center justify-center border ${fullTank ? "bg-brand border-brand" : "bg-bg-soft border-line"}`}>
              {fullTank && <Check size={16} color="#fff" />}
            </View>
            <View className="flex-1">
              <Text className="text-ink-soft">Plin complet</Text>
              <Text className="text-ink-faint text-xs">Necesar pentru calculul consumului L/100km</Text>
            </View>
          </Pressable>

          <AppButton title="Salvează alimentarea" onPress={save} loading={saving} className="mt-1" />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
