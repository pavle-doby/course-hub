import "@/global.css";
import i18n from "@repo/i18n/native";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ApiClientProvider } from "@repo/api-client";
import { RootNavigator } from "@/components/navigation/root-navigator";
import { AuthProvider } from "@/providers/auth-provider";
import { deviceLocale } from "@/utils/device-locale";

void SplashScreen.preventAutoHideAsync();
void i18n.changeLanguage(deviceLocale);

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ApiClientProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </ApiClientProvider>
    </GestureHandlerRootView>
  );
}
