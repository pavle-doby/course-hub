import { JSX, ReactNode, useId } from 'react';
import { Input, InputProps, YStack, YStackProps } from 'tamagui';
import { UIMessage } from './UIMessage';
import { UILabel } from './UILabel';
import { UIFlex } from '../layouts/UIFlex';
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

export function UIInput(props: UIInputProps): JSX.Element {
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
        <UIFlex
          flexDirection="row"
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
        </UIFlex>
      )}

      <Input
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
