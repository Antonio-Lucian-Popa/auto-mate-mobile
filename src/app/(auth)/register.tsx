import { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { Link } from "expo-router";
import { Mail, Lock, User, Building2 } from "lucide-react-native";
import { useForm, Controller } from "react-hook-form";
import { AppButton } from "@/components/ui/AppButton";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useAuthStore } from "@/stores/authStore";

type Form = { name: string; companyName: string; email: string; password: string };

export default function RegisterScreen() {
  const { control, handleSubmit } = useForm<Form>({ defaultValues: { name: "", companyName: "", email: "", password: "" } });
  const register = useAuthStore((s) => s.register);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (d: Form) => {
    setLoading(true);
    setErr(null);
    try {
      await register(d.email.trim(), d.password, d.name.trim() || undefined, d.companyName.trim());
    } catch (e: any) {
      setErr(e.message ?? "Înregistrare eșuată.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen className="flex-1 bg-bg">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: "center" }} keyboardShouldPersistTaps="handled">
          <Text className="text-ink text-3xl font-bold mb-1">Creează cont</Text>
          <Text className="text-ink-soft mb-8">Începe să-ți gestionezi flota</Text>
          <View className="gap-4">
            <Controller control={control} name="companyName" rules={{ required: "Introdu numele companiei" }} render={({ field: { value, onChange }, fieldState }) => (
              <AppTextInput label="Companie *" placeholder="Numele firmei" value={value} onChangeText={onChange} error={fieldState.error?.message} icon={<Building2 size={18} color="#6B7693" />} />
            )} />
            <Controller control={control} name="name" render={({ field: { value, onChange } }) => (
              <AppTextInput label="Nume" placeholder="Numele tău" value={value} onChangeText={onChange} icon={<User size={18} color="#6B7693" />} />
            )} />
            <Controller control={control} name="email" rules={{ required: "Introdu emailul" }} render={({ field: { value, onChange }, fieldState }) => (
              <AppTextInput label="Email" placeholder="email@exemplu.ro" keyboardType="email-address" autoCapitalize="none" value={value} onChangeText={onChange} error={fieldState.error?.message} icon={<Mail size={18} color="#6B7693" />} />
            )} />
            <Controller control={control} name="password" rules={{ required: "Introdu parola", minLength: { value: 6, message: "Minim 6 caractere" } }} render={({ field: { value, onChange }, fieldState }) => (
              <AppTextInput label="Parolă" placeholder="••••••••" secureTextEntry value={value} onChangeText={onChange} error={fieldState.error?.message} icon={<Lock size={18} color="#6B7693" />} />
            )} />
            {err && <Text className="text-danger text-sm text-center">{err}</Text>}
            <AppButton title="Creează cont" onPress={handleSubmit(onSubmit)} loading={loading} className="mt-2" />
          </View>
          <View className="flex-row justify-center mt-8 gap-1">
            <Text className="text-ink-soft">Ai deja cont?</Text>
            <Link href="/(auth)/login" className="text-brand-glow font-semibold">Autentifică-te</Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
