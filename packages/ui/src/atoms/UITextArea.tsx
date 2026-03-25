import { JSX, ReactNode, useId } from 'react';
import { GetProps, TextArea, XStack, YStack, YStackProps } from 'tamagui';
import { UIMessage } from './UIMessage';
import { UILabel } from './UILabel';
import { UIButton, UIButtonProps } from './UIButton';

interface UITextAreaProps extends GetProps<typeof TextArea> {
  label?: string;

  action?: {
    content: string;
    props?: UIButtonProps;
    onPress: () => void;
  };

  error?: string | boolean;
  warning?: string | boolean;
  message?: string | boolean | ReactNode;

  wrapperProps?: YStackProps;

  children?: ReactNode;
}

export function UITextArea(props: UITextAreaProps): JSX.Element {
  const {
    label,
    placeholder,

    action,

    error,
    warning,
    message,

    wrapperProps,

    ...otherProps
  } = props;

  const id = props.id || useId();

  return (
    <YStack
      flexShrink={1}
      flexGrow={1}
      flexBasis={'auto'}
      {...wrapperProps}
    >
      {(label || action) && (
        <XStack
          justifyContent={label && action ? 'space-between' : label ? 'flex-start' : 'flex-end'}
          marginBottom={'$2'}
        >
          {label && (
            <UILabel
              id={id}
              label={label}
              marginBottom={0}
            />
          )}
          {action &&
            (typeof action.content === 'string' ? (
              <UIButton
                clean
                small
                primary
                contrast
                onPress={action.onPress}
                {...action.props}
              >
                {action.content}
              </UIButton>
            ) : (
              action?.content
            ))}
        </XStack>
      )}
      <TextArea
        id={id}
        paddingHorizontal={'$2'}
        paddingVertical={'$2'}
        fontSize={'$4'}
        placeholder={placeholder}
        placeholderTextColor={'$secondary'}
        {...(error && { borderColor: '$danger', outlineColor: '$danger' })}
        {...(warning && { borderColor: '$warning', outlineColor: '$warning' })}
        hoverStyle={{
          ...(error && {
            borderColor: '$danger',
          }),
          ...(warning && {
            borderColor: '$warning',
          }),
        }}
        focusStyle={{
          ...(error && {
            borderColor: '$danger',
            outlineColor: '$danger',
          }),
          ...(warning && {
            borderColor: '$warning',
            outlineColor: '$warning',
          }),
        }}
        {...otherProps}
      />

      {error && (
        <UIMessage.Danger
          id={id}
          message={error}
        />
      )}
      {warning && (
        <UIMessage.Warning
          id={id}
          message={warning}
        />
      )}
      {message && (
        <UIMessage.Message
          id={id}
          message={message}
        />
      )}
    </YStack>
  );
}
