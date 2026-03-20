import { UIFlex, H1, Paragraph } from '@my/ui';

interface UIPageInfo {
  title: string;
  info: string;
}

export function UIPageInfo(props: UIPageInfo): JSX.Element {
  const { title, info } = props;

  return (
    <UIFlex width={'$full'} gap="$2" maxWidth={'$96'}>
      <H1 unstyled size={'$9'}>
        {title}
      </H1>
      <Paragraph>{info}</Paragraph>
    </UIFlex>
  );
}
