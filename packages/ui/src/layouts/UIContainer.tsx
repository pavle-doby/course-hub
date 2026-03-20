import { JSX, ReactNode } from 'react';
import { UIFlex } from '@my/ui';

interface UIContainerProps {
  children: ReactNode;
}

/**
 * Simple container for centering content
 */
export function UIContainer({ children }: UIContainerProps): JSX.Element {
  return (
    <UIFlex
      alignItems="center"
      justifyContent="flex-start"
      grow
      height={'$full'}
      width={'$full'}
    >
      <UIFlex
        grow
        alignItems="center"
        justifyContent="center"
        gap={'$6'}
        width="$full"
        height={'$full'}
        maxWidth="$150"
        padding={'$6'}
      >
        {children}
      </UIFlex>
    </UIFlex>
  );
}
