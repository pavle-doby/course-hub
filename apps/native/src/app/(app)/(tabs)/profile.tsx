import { useAuthSignOut } from "@repo/api-client";
import { useTranslation } from "@repo/i18n/native";
import { Button } from "@repo/ui-native/components/button";
import { Text } from "@repo/ui-native/components/text";
import { PlaceholderScreen } from "@/components/placeholder-screen";
import { useAuth } from "@/providers/auth-provider";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const { mutate: signOutMutate, isPending } = useAuthSignOut();

  function handleLogOut() {
    // Best effort server sign-out; local tokens are cleared either way
    signOutMutate(undefined, { onSettled: () => void signOut() });
  }

  return (
    <PlaceholderScreen title={t("nav.profile")}>
      <Button variant="outline" disabled={isPending} onPress={handleLogOut}>
        <Text>{t("nav.logOut")}</Text>
      </Button>
    </PlaceholderScreen>
  );
}
