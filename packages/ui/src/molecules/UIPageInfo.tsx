import { H1, Paragraph, YStack } from '@my/ui';
import { JSX } from 'react';

interface UIPageInfo {
  title: string;
  info: string;
}

export function UIPageInfo(props: UIPageInfo): JSX.Element {
  const { title, info } = props;

  return (
    <YStack
      width={'$full'}
      gap="$2"
      maxWidth={'$96'}
    >
      <H1
        unstyled
        size={'$9'}
      >
        {title}
      </H1>
      <Paragraph>{info}</Paragraph>
    </YStack>
  );
}
