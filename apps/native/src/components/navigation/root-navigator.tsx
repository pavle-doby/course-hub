import { useEffect } from "react";
import { Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { PortalHost } from "@rn-primitives/portal";
import { Toaster } from "@repo/ui-native/components/sonner";
import { NAV_THEME } from "@repo/ui-theme/native";
import { ConfettiProvider } from "@/components/confetti/confetti-provider";
import { useAuth } from "@/providers/auth-provider";

export function RootNavigator() {
  const { status } = useAuth();
  const { colorScheme = "light" } = useColorScheme();
  const isSignedIn = status === "signedIn";

  // The splash screen covers the auth screen while the stored tokens load.
  useEffect(() => {
    if (status !== "loading") {
      void SplashScreen.hideAsync();
    }
  }, [status]);

  return (
    <ThemeProvider value={NAV_THEME[colorScheme]}>
      <ConfettiProvider>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={isSignedIn}>
            <Stack.Screen name="(app)" />
          </Stack.Protected>
          <Stack.Protected guard={!isSignedIn}>
            <Stack.Screen name="(auth)" />
          </Stack.Protected>
        </Stack>
        <PortalHost />
        <Toaster />
      </ConfettiProvider>
    </ThemeProvider>
  );
}
