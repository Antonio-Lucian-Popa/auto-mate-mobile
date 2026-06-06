import { useState } from "react";
import { View, Text, TextInput, type TextInputProps } from "react-native";
import { cn } from "@/lib/cn";

type Props = TextInputProps & {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
};

export function AppTextInput({ label, error, icon, className, value, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  const isNumeric = rest.keyboardType === "decimal-pad" || rest.keyboardType === "number-pad" || rest.keyboardType === "numeric";
  return (
    <View className="gap-2">
      {label && <Text className="text-ink-soft text-sm font-medium">{label}</Text>}
      <View
        className={cn(
          "flex-row items-center gap-3 bg-bg-soft border rounded-2xl px-4 h-14",
          focused ? "border-brand" : "border-line",
          error && "border-danger"
        )}
      >
        {icon}
        <TextInput
          placeholderTextColor="#6B7693"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCorrect={rest.autoCorrect ?? false}
          autoComplete={rest.autoComplete ?? (isNumeric ? "off" : undefined)}
          importantForAutofill={rest.importantForAutofill ?? (isNumeric ? "no" : undefined)}
          textContentType={rest.textContentType ?? (isNumeric ? "none" : undefined)}
          value={value ?? ""}
          className={cn("flex-1 text-ink text-base", className)}
          {...rest}
        />
      </View>
      {error && <Text className="text-danger text-xs">{error}</Text>}
    </View>
  );
}
