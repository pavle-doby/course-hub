import { SizeTokens, Switch, SwitchProps, XStack, getVariableValue, styled } from 'tamagui';
import { UILabel, UILabelProps } from './UILabel';
import { JSX, useState } from 'react';
import { getSize } from '@tamagui/get-token';
import { getStylingColor, StylingProps } from '../utils/styling';

type UISwitchProps = Omit<SwitchProps, 'size'> &
  StylingProps & {
    label?: string;
    labelPlace?: 'left' | 'right';
    labelProps?: UILabelProps;
    size?: SizeTokens;
  };

export function UISwitch(props: UISwitchProps): JSX.Element {
  const {
    id,
    label,
    labelPlace = 'right',
    labelProps,
    size = '$6',
    checked,

    primary,
    secondary,
    danger,
    accent,
    info,
    success,
    warning,
    base,
    neutral,

    ...other
  } = props;

  const [isChecked, setIsChecked] = useState(checked);

  function handleCheckedChange(value: boolean) {
    setIsChecked(value);

    if (props.onCheckedChange) {
      props.onCheckedChange(value);
    }
  }

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

  // TODO@pavle: Test this styling
  const style = {
    ...(isChecked && {
      switch: {
        backgroundColor: `${styling}-300`,
        borderColor: `${styling}-300`,
      },
      thumb: {
        backgroundColor: `${styling}-700`,
      },
    }),
    ...(!isChecked && {
      switch: {
        backgroundColor: `${styling}-200`,
        borderColor: `${styling}-200`,
      },
      thumb: {
        backgroundColor: `${styling}-400`,
      },
    }),
  } as any;

  return (
    <XStack
      display="flex"
      flexDirection="row"
      alignItems="center"
    >
      {label && labelPlace === 'left' && (
        <UILabel
          id={id}
          label={label}
          marginBottom={0}
          marginRight={'$2'}
          {...labelProps}
        />
      )}

      <StyledSwitch
        id={id}
        size={size}
        checked={checked}
        {...style.switch}
        {...other}
        onCheckedChange={handleCheckedChange}
      >
        <StyledThumb
          size={size}
          {...style.thumb}
        />
      </StyledSwitch>

      {label && labelPlace === 'right' && (
        <UILabel
          id={id}
          label={label}
          marginBottom={0}
          marginLeft={'$2'}
          {...labelProps}
        />
      )}
    </XStack>
  );
}

// `Switch` is styled so we can use custom `size` prop
const StyledSwitch = styled(Switch, {
  backgroundColor: '$primary',
  cursor: 'pointer',

  variants: {
    size: {
      '...size': (token) => {
        const val = getValue(token);

        return {
          height: getSwitchHeight(val) + 4,
          width: getSwitchWidth(val) + 4,
        };
      },
    },
  },
});

// `Thumb` is styled so we can use custom `size` prop
const StyledThumb = styled(Switch.Thumb, {
  variants: {
    size: {
      '...size': (token) => {
        const val = getValue(token);

        return {
          width: getSwitchHeight(val),
          height: getSwitchHeight(val),
        };
      },
    },
  },
});

const getSwitchHeight = (size = 24) => size;
const getSwitchWidth = (size = 24) => size * 2;

// TODO: Think of moving this to utils
function getValue(token: SizeTokens) {
  const size = getSize(token);
  const val = getVariableValue(size);

  return val;
}
