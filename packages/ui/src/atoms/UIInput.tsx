import { JSX, ReactNode, forwardRef, useId } from 'react';
import { Input, InputProps, XStack, YStack, YStackProps } from 'tamagui';
import { UIMessage } from './UIMessage';
import { UILabel } from './UILabel';
import { UIButton } from './UIButton';
import { UIButtonProps } from './UIButton';

interface UIInputProps extends InputProps {
  type?: string;
  name?: string;
  label?: string;

  action?: {
    content: string | ReactNode;
    props?: UIButtonProps;
    onPress: () => void;
  };

  error?: string | boolean;
  warning?: string | boolean;
  message?: string | boolean | ReactNode;

  wrapperProps?: YStackProps;

  children?: ReactNode;
}

export const UIInput = forwardRef<React.ComponentRef<typeof Input>, UIInputProps>(
  function UIInput(props, ref) {
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
            flexDirection="row"
            justifyContent={label && action ? 'space-between' : label ? 'flex-start' : 'flex-end'}
            alignItems="center"
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

        <Input
          ref={ref}
          id={id}
          height={'$10'}
          paddingHorizontal={'$2'}
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
);
