import { Stack } from "expo-router";
import { PreferencesSync } from "@/providers/preferences-sync";

// Detail screens (course reader, editor, …) are added to this stack in later tasks.
export default function AppLayout() {
  return (
    <>
      <PreferencesSync />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
