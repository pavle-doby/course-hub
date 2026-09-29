import { AlertCircleIcon } from "lucide-react-native";
import { Alert, AlertTitle } from "@repo/ui-native/components/alert";

export function FormRootError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }
  return (
    <Alert variant="destructive" icon={AlertCircleIcon}>
      <AlertTitle>{message}</AlertTitle>
    </Alert>
  );
}
