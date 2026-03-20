import { ColorTokens } from 'tamagui';

export type StylingProps = {
  primary?: boolean;
  secondary?: boolean;
  danger?: boolean;
  accent?: boolean;
  info?: boolean;
  success?: boolean;
  warning?: boolean;
  base?: boolean;
  neutral?: boolean;
};

/**
 * Returns proper `color` based on the `styling` prop.
 */
export function getStylingColor(props: StylingProps): ColorTokens {
  if (props.primary) return '$primary';
  if (props.secondary) return '$secondary';
  if (props.danger) return '$danger';
  if (props.accent) return '$accent';
  if (props.info) return '$info';
  if (props.success) return '$success';
  if (props.warning) return '$warning';
  if (props.base) return '$base';
  if (props.neutral) return '$neutral';

  return '$neutral';
}
