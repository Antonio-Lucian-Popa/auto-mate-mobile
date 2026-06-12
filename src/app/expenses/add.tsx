import { useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { AppButton } from "@/components/ui/AppButton";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { SegmentedField } from "@/components/forms/SegmentedField";
import { useCreateExpense } from "@/hooks/useExpenses";
import { expensesApi } from "@/services/api/expenses";
import { ocrApi } from "@/services/api/ocr";
import { EXPENSE_CATEGORIES } from "@/constants";
import { pickFromCamera, pickFromLibrary } from "@/hooks/useImagePicker";
import { Camera, Sparkles } from "lucide-react-native";
import type { ExpenseInput } from "@/services/api/expenses";
import type { ExpenseCategory } from "@/types";

type Form = {
  category: ExpenseCategory;
  amount: string;
  currency: string;
  date: string;
  merchant: string;
  merchantCif: string;
  notes: string;
};

export default function AddExpenseScreen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const { control, handleSubmit, setValue } = useForm<Form>({
    defaultValues: { category: "ALTELE", amount: "", currency: "RON", date: new Date().toISOString().split("T")[0], merchant: "", merchantCif: "", notes: "" },
  });
  const createExpense = useCreateExpense();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handlePickImage = async () => {
    const uri = await pickFromLibrary();
    if (!uri) return;
    setImageUri(uri);
    setUploading(true);
    setErr(null);
    try {
      const { imageUrl } = await expensesApi.upload(uri);
      setUploading(false);
      setScanning(true);
      try {
        const ocr = await ocrApi.scanReceipt(imageUrl);
        if (ocr.amount) setValue("amount", String(ocr.amount));
        if (ocr.currency) setValue("currency", ocr.currency);
        if (ocr.date) setValue("date", ocr.date);
        if (ocr.merchant) setValue("merchant", ocr.merchant);
        if (ocr.cif) setValue("merchantCif", ocr.cif);
        if (ocr.category) setValue("category", ocr.category);
      } catch {}
      setScanning(false);
      setImageUri(imageUrl);
    } catch (e: any) {
      setErr("Eroare la upload imagine.");
      setUploading(false);
      setScanning(false);
    }
  };

  const onSubmit = async (d: Form) => {
    setErr(null);
    try {
      const input: ExpenseInput = {
        tripId: tripId || undefined,
        category: d.category,
        amount: parseFloat(d.amount),
        currency: d.currency,
        date: d.date,
        merchant: d.merchant.trim() || undefined,
        merchantCif: d.merchantCif.trim() || undefined,
        notes: d.notes.trim() || undefined,
        imageUrl: typeof imageUri === "string" && imageUri.startsWith("http") ? imageUri : undefined,
      };
      await createExpense.mutateAsync(input);
      router.back();
    } catch (e: any) {
      setErr(e.message ?? "Eroare la salvare cheltuială.");
    }
  };

  const categoryOptions = EXPENSE_CATEGORIES.map((c) => ({ value: c.value, label: c.label }));

  return (
    <Screen className="flex-1 bg-bg">
      <ScreenHeader title="Cheltuială nouă" onBack={() => router.back()} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          {/* Upload bon */}
          <TouchableOpacity
            onPress={handlePickImage}
            className="border-2 border-dashed border-line rounded-2xl p-5 items-center gap-2"
            disabled={uploading || scanning}
          >
            {uploading ? (
              <>
                <ActivityIndicator color="#5B8DEF" />
                <Text className="text-ink-soft text-sm">Se uploadează bonul...</Text>
              </>
            ) : scanning ? (
              <>
                <Sparkles size={24} color="#A78BFA" />
                <Text className="text-ink-soft text-sm">OCR în progres...</Text>
              </>
            ) : imageUri ? (
              <Image source={{ uri: imageUri }} className="w-full h-40 rounded-xl" resizeMode="cover" />
            ) : (
              <>
                <Camera size={28} color="#5B8DEF" />
                <Text className="text-ink-soft text-sm">Fotografiază bonul (pre-completare automată)</Text>
              </>
            )}
          </TouchableOpacity>

          <Controller control={control} name="category" render={({ field: { value, onChange } }) => (
            <SegmentedField label="Categorie" options={categoryOptions} value={value} onChange={onChange} />
          )} />
          <Controller control={control} name="amount" rules={{ required: "Suma este obligatorie" }} render={({ field: { value, onChange }, fieldState }) => (
            <AppTextInput label="Sumă *" placeholder="0.00" keyboardType="decimal-pad" value={value} onChangeText={onChange} error={fieldState.error?.message} />
          )} />
          <Controller control={control} name="currency" render={({ field: { value, onChange } }) => (
            <AppTextInput label="Monedă" placeholder="RON" value={value} onChangeText={onChange} />
          )} />
          <Controller control={control} name="date" render={({ field: { value, onChange } }) => (
            <DatePickerField label="Data *" value={value} onChange={onChange} />
          )} />
          <Controller control={control} name="merchant" render={({ field: { value, onChange } }) => (
            <AppTextInput label="Comerciant" placeholder="ex: McDonald's" value={value} onChangeText={onChange} />
          )} />
          <Controller control={control} name="merchantCif" render={({ field: { value, onChange } }) => (
            <AppTextInput label="CIF comerciant" placeholder="ex: RO12345678" value={value} onChangeText={onChange} />
          )} />
          <Controller control={control} name="notes" render={({ field: { value, onChange } }) => (
            <AppTextInput label="Note" placeholder="Detalii suplimentare" value={value} onChangeText={onChange} multiline />
          )} />
          {err && <Text className="text-danger text-sm text-center">{err}</Text>}
          <AppButton title="Salvează cheltuială" onPress={handleSubmit(onSubmit)} loading={createExpense.isPending} className="mt-2" />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
