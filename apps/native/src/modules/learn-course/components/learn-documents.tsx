import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { openBrowserAsync } from "expo-web-browser";
import { FileTextIcon } from "lucide-react-native";
import type { PublicDocument } from "@repo/api-client";
import { useTranslation } from "@repo/i18n/native";
import { Icon } from "@repo/ui-native/components/icon";
import { Text } from "@repo/ui-native/components/text";

type LearnDocumentsProps = {
  documents: PublicDocument[];
};

/** Attached documents; tapping one opens its signed URL in the in-app browser. */
export function LearnDocuments({ documents }: LearnDocumentsProps) {
  const { t } = useTranslation();

  if (documents.length === 0) {
    return null;
  }

  return (
    <View className="mt-4 gap-2">
      <Text className="font-medium">{t("learn.detail.documents")}</Text>
      {documents.map((document) => (
        <Pressable
          key={document.id}
          className="flex-row items-center gap-3 rounded-lg border border-border p-2 active:bg-accent"
          accessibilityRole="link"
          onPress={() => void openBrowserAsync(document.publicUrl)}
        >
          <View className="size-12 items-center justify-center overflow-hidden rounded-md bg-muted">
            {document.contentType.startsWith("image/") ? (
              <Image
                source={{ uri: document.publicUrl }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
                accessibilityLabel={document.originalFileName}
              />
            ) : (
              <Icon as={FileTextIcon} size={20} />
            )}
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium">{document.originalFileName}</Text>
            <Text variant="muted" className="text-xs">
              {document.contentType}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}
