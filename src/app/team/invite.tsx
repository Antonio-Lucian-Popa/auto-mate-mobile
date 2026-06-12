import { useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { AppButton } from "@/components/ui/AppButton";
import { SegmentedField } from "@/components/forms/SegmentedField";
import { useInviteUser } from "@/hooks/useUsers";
import type { InviteInput } from "@/services/api/users";
import type { UserRole } from "@/types";
import { Mail, User } from "lucide-react-native";

type Form = {
  email: string;
  firstName: string;
  lastName: string;
  role: Exclude<UserRole, "ADMIN">;
};

const ROLE_OPTIONS = [
  { value: "MANAGER", label: "Manager" },
  { value: "ACCOUNTANT", label: "Contabil" },
  { value: "EMPLOYEE", label: "Angajat" },
];

export default function InviteScreen() {
  const { control, handleSubmit } = useForm<Form>({
    defaultValues: { email: "", firstName: "", lastName: "", role: "EMPLOYEE" },
  });
  const inviteUser = useInviteUser();
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (d: Form) => {
    setErr(null);
    try {
      const input: InviteInput = {
        email: d.email.trim(),
        firstName: d.firstName.trim() || undefined,
        lastName: d.lastName.trim() || undefined,
        role: d.role,
      };
      const result = await inviteUser.mutateAsync(input);
      Alert.alert(
        "Invitație trimisă",
        `Am trimis invitația pe email la ${result.user.email}. Utilizatorul își va activa contul din linkul primit.`,
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (e: any) {
      setErr(e.message ?? "Eroare la trimitere invitație.");
    }
  };

  return (
    <Screen className="flex-1 bg-bg">
      <ScreenHeader title="Invită utilizator" onBack={() => router.back()} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Controller control={control} name="email" rules={{ required: "Emailul este obligatoriu" }} render={({ field: { value, onChange }, fieldState }) => (
            <AppTextInput label="Email *" placeholder="coleg@firma.ro" keyboardType="email-address" autoCapitalize="none" value={value} onChangeText={onChange} error={fieldState.error?.message} icon={<Mail size={18} color="#6B7693" />} />
          )} />
          <Controller control={control} name="firstName" render={({ field: { value, onChange } }) => (
            <AppTextInput label="Prenume" placeholder="Prenume" value={value} onChangeText={onChange} icon={<User size={18} color="#6B7693" />} />
          )} />
          <Controller control={control} name="lastName" render={({ field: { value, onChange } }) => (
            <AppTextInput label="Nume" placeholder="Nume de familie" value={value} onChangeText={onChange} icon={<User size={18} color="#6B7693" />} />
          )} />
          <Controller control={control} name="role" render={({ field: { value, onChange } }) => (
            <SegmentedField label="Rol" options={ROLE_OPTIONS} value={value} onChange={onChange} />
          )} />
          {err && <Text className="text-danger text-sm text-center">{err}</Text>}
          <AppButton title="Trimite invitație" onPress={handleSubmit(onSubmit)} loading={inviteUser.isPending} className="mt-2" />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
