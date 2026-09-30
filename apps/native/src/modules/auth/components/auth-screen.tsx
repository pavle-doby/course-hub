import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "@/components/keyboard-aware-scroll-view";

/** Scrollable, keyboard-aware wrapper for the login / signup forms. */
export function AuthScreen({ children }: React.PropsWithChildren) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-background"
      contentContainerClassName="grow justify-center gap-6 p-6"
      contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }}
      keyboardShouldPersistTaps="handled"
      bottomOffset={24}
    >
      {children}
    </KeyboardAwareScrollView>
  );
}
