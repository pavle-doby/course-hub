import { JSX, Ref, forwardRef } from 'react';
import { Button, ButtonProps, GetThemeValueForKey, TamaguiElement } from 'tamagui';
import { getStylingColor, StylingProps } from '../utils/styling';

// Omitting `variant` prop from `ButtonProps` because we want to use our own `variant` props
export type UIButtonProps = Omit<ButtonProps, 'variant'> &
  StylingProps &
  UIButtonVariantProps &
  UIButtonSizeProps & {
    contrast?: boolean;
  };

export type UIButtonVariantProps = {
  solid?: boolean;
  outlined?: boolean;
  clean?: boolean;
};

// TODO: Add this sizes to other components
export type UIButtonSizeProps = {
  small?: boolean;
  medium?: boolean;
  large?: boolean;
};

// #region Helper functions for determining styling and variant

function getVariant(props: UIButtonVariantProps): keyof UIButtonVariantProps {
  if (props.solid) return 'solid';
  if (props.outlined) return 'outlined';
  if (props.clean) return 'clean';

  return 'solid';
}

function getSize(props: UIButtonSizeProps): keyof UIButtonSizeProps {
  if (props.small) return 'small';
  if (props.medium) return 'medium';
  if (props.large) return 'large';

  return 'medium';
}

// #endregion

/**
 * Button that follows the Fasterr design system.
 *
 * @default
 * styling: neutral
 * variant: solid
 *
 * @example
 * // for `styling` and `variant` props
 * <UIButton primary outlined>Primary Outline</UIButton>
 *
 * @example
 * // for `styling` and `variant` props that are dynamically set
 * <UIButton primary={isPrimary} outlined={isOutlined}>Primary Outline</UIButton>
 * <UIButton {...{ [styling]: true, [variant]: true }}>Dynamic</UIButton>
 */
export const UIButton = forwardRef(
  (props: UIButtonProps, ref: Ref<TamaguiElement>): JSX.Element => {
    const {
      // variant
      solid,
      outlined,
      clean,

      // styling
      primary,
      secondary,
      danger,
      accent,
      info,
      success,
      warning,
      base,
      neutral,

      contrast,

      // size
      small,
      medium,
      large,

      ...otherProps
    } = props;

    const styling = getStylingColor({
      primary,
      secondary,
      danger,
      accent,
      info,
      success,
      warning,
      base,
      neutral,
    });

    const variant = getVariant({ solid, outlined, clean });
    const size = getSize({ small, medium, large });

    const sizeStyles = {
      small: {
        button: {
          minHeight: '$8',
          paddingVertical: '$0.5',
          paddingHorizontal: '$2',
        },
        text: {
          fontSize: '$3.5',
          fontWeight: '400',
        },
      },
      medium: {
        button: {
          minHeight: '$10',
          paddingVertical: '$1',
          paddingHorizontal: '$2',
        },
        text: {
          fontSize: '$4',
          fontWeight: '400',
        },
      },
      large: {
        button: {
          minHeight: '$14',
          paddingVertical: '$2',
          paddingHorizontal: '$4',
        },
        text: {
          fontSize: '$5',
          fontWeight: '400',
        },
      },
    };

    const variantStyles = {
      solid: {
        button: {
          color: contrast ? `${styling}` : `${styling}-contrast`,
          backgroundColor: contrast ? `${styling}-contrast` : `${styling}`,
          borderColor: contrast ? `${styling}-contrast` : `${styling}`,
          hoverStyle: {
            color: `${styling}-contrast`,
            backgroundColor: `${styling}-500`,
            borderColor: `${styling}-500`,
          },
          pressStyle: {
            color: `${styling}-contrast`,
            backgroundColor: `${styling}-700`,
            borderColor: `${styling}-700`,
          },
          disabledStyle: {
            backgroundColor: `${styling}-400`,
            borderColor: `${styling}-400`,
          },
        },
        text: {},
      },
      outlined: {
        button: {
          color: contrast ? `${styling}-contrast` : `${styling}`,
          backgroundColor: `transparent`,
          borderColor: contrast ? `${styling}-contrast` : `${styling}`,
          borderWidth: 2,
          hoverStyle: {
            color: `${styling}-500`,
            backgroundColor: `transparent`,
            borderColor: `${styling}-500`,
          },
          pressStyle: {
            color: `${styling}-700`,
            backgroundColor: `transparent`,
            borderColor: `${styling}-700`,
          },
          disabledStyle: {
            color: `${styling}-400`,
            borderColor: `${styling}-400`,
          },
        },
        text: {},
      },
      clean: {
        button: {
          color: contrast ? `${styling}-contrast` : `${styling}`,
          backgroundColor: `transparent`,
          borderColor: `transparent`,
          paddingVertical: 0,
          paddingHorizontal: 0,
          minHeight: 'auto',
          hoverStyle: {
            color: `${styling}-500`,
            backgroundColor: `transparent`,
            borderColor: `transparent`,
          },
          pressStyle: {
            color: `${styling}-700`,
            backgroundColor: `transparent`,
            borderColor: `transparent`,
          },
          disabledStyle: {
            color: `${styling}-400`,
            borderColor: `transparent`,
          },
        },
        text: {
          fontWeight: '500',
        },
      },
    };

    const buttonStyle = {
      ...sizeStyles[size].button,
      ...variantStyles[variant].button,
    };

    const textStyle = {
      ...sizeStyles[size].text,
      ...variantStyles[variant].text,
    };

    return (
      <Button
        ref={ref}
        {...(buttonStyle as UIButtonProps)}
        {...otherProps}
      >
        <Button.Text {...(textStyle as any)}>{props.children}</Button.Text>
      </Button>
    );
  }
);
