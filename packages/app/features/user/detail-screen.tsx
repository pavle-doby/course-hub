'use client';

import { Paragraph, UIButton, YStack } from '@my/ui';
import { ChevronLeft } from '@tamagui/lucide-icons';
import { useRouter } from 'solito/navigation';

export function UserDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  
  if (!id) {
    return null;
  }

  return (
    <YStack
      flex={1}
      justify="center"
      items="center"
      gap="$4"
      bg="$background"
    >
      <Paragraph
        text="center"
        fontWeight="700"
        color="$accent"
      >
        {`User ID: ${id}`}
      </Paragraph>

      <UIButton
        icon={ChevronLeft}
        onPress={() => router.back()}
      >
        Go Home
      </UIButton>
    </YStack>
  );
}
