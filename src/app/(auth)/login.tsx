import { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { Link } from "expo-router";
import { Mail, Lock, Car } from "lucide-react-native";
import { useForm, Controller } from "react-hook-form";
import { AppButton } from "@/components/ui/AppButton";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { useAuthStore } from "@/stores/authStore";

type Form = { email: string; password: string };

export default function LoginScreen() {
  const { control, handleSubmit } = useForm<Form>({ defaultValues: { email: "", password: "" } });
  const login = useAuthStore((s) => s.login);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (data: Form) => {
    setLoading(true);
    setErr(null);
    try {
      await login(data.email.trim(), data.password);
    } catch (e: any) {
      setErr(e.message ?? "Autentificare eșuată.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen className="flex-1 bg-bg">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }} keyboardShouldPersistTaps="handled">
          <View className="items-center mb-10">
            <View className="w-16 h-16 rounded-3xl bg-brand items-center justify-center mb-4">
              <Car size={32} color="#fff" />
            </View>
            <Text className="text-ink text-3xl font-bold">Bine ai revenit</Text>
            <Text className="text-ink-soft mt-1">Autentifică-te în AutoMate</Text>
          </View>

          <View className="gap-4">
            <Controller
              control={control}
              name="email"
              rules={{ required: "Introdu emailul" }}
              render={({ field: { value, onChange }, fieldState }) => (
                <AppTextInput
                  label="Email"
                  placeholder="email@exemplu.ro"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  error={fieldState.error?.message}
                  icon={<Mail size={18} color="#6B7693" />}
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              rules={{ required: "Introdu parola" }}
              render={({ field: { value, onChange }, fieldState }) => (
                <AppTextInput
                  label="Parolă"
                  placeholder="••••••••"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  error={fieldState.error?.message}
                  icon={<Lock size={18} color="#6B7693" />}
                />
              )}
            />
            {err && <Text className="text-danger text-sm text-center">{err}</Text>}
            <AppButton title="Autentificare" onPress={handleSubmit(onSubmit)} loading={loading} className="mt-2" />
          </View>

          <View className="flex-row justify-center mt-8 gap-1">
            <Text className="text-ink-soft">Nu ai cont?</Text>
            <Link href="/(auth)/register" className="text-brand-glow font-semibold">Creează cont</Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
