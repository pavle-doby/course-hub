import { JSX, ReactNode } from 'react';
import { YStack } from 'tamagui';

interface UIContainerProps {
  children: ReactNode;
}

/**
 * Simple container for centering content
 */
export function UIContainer({ children }: UIContainerProps): JSX.Element {
  return (
    <YStack
      alignItems="center"
      justifyContent="flex-start"
      flexGrow={1}
      height={'$full'}
      width={'$full'}
    >
      <YStack
        flexGrow={1}
        alignItems="center"
        justifyContent="center"
        gap={'$6'}
        width="$full"
        height={'$full'}
        maxWidth="$150"
        padding={'$6'}
      >
        {children}
      </YStack>
    </YStack>
  );
}
