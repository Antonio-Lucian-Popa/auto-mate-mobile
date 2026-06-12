import { Stack } from "expo-router";

export default function ExpensesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="add" />
      <Stack.Screen name="[id]" options={{ presentation: "modal" }} />
    </Stack>
  );
}
