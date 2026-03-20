import { JSX, ReactNode } from 'react';
import { Card, CardProps } from 'tamagui';

interface UICardProps extends CardProps {
  children: ReactNode;
}

export function UICard({ children, ...other }: UICardProps): JSX.Element {
  // TODO@pavle: Add border
  return (
    <Card
      width={'$full'}
      padding={'$4'}
      backgroundColor={'$neutral'}
      $aboveMobile={{ padding: '$6' }}
      {...other}
    >
      {children}
    </Card>
  );
}
