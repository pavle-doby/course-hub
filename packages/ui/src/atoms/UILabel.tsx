import { JSX, ReactNode } from 'react';
import { FontSizeTokens, Label, LabelProps, SizableText } from 'tamagui';

export interface UILabelProps extends LabelProps {
  id?: string;
  label?: string;
  children?: string | ReactNode;
}

/**
 * Label used for Inputs (Input, Select, TextArea...)
 */
export function UILabel({ id, label, children, ...other }: UILabelProps): JSX.Element {
  return (
    <Label
      htmlFor={id}
      cursor={id ? 'pointer' : 'default'}
      marginBottom="$2"
      {...other}
    >
      <SizableText
        fontWeight="500"
        fontSize={'$3.5' as FontSizeTokens}
      >
        {label || children}
      </SizableText>
    </Label>
  );
}
