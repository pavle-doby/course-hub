import { JSX, ReactNode } from 'react';
import { FontSizeTokens, GetThemeValueForKey, SizableText } from 'tamagui';

interface UIMessageMessageProps {
  id?: string;
  color?: GetThemeValueForKey<'color'>;
  message: boolean | string | ReactNode;
}

export function UIMessage({ id, color, message }: UIMessageMessageProps): JSX.Element {
  return (
    <SizableText
      htmlFor={id}
      color={color}
      fontSize={'$3.5' as FontSizeTokens}
      marginTop="$1.5"
    >
      {message}
    </SizableText>
  );
}

UIMessage.Message = UIMessage;

UIMessage.Danger = (props: Omit<UIMessageMessageProps, 'color'>) => (
  <UIMessage
    {...props}
    color={'$danger'}
  />
);

UIMessage.Warning = (props: Omit<UIMessageMessageProps, 'color'>) => (
  <UIMessage
    {...props}
    color={'$warning'}
  />
);

UIMessage.Info = (props: Omit<UIMessageMessageProps, 'color'>) => (
  <UIMessage
    {...props}
    color={'$info'}
  />
);
