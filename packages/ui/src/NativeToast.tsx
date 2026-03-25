import { Toast, useToastState } from '@tamagui/toast';
import { ColorTokens, YStack } from 'tamagui';
import { getStylingColor } from './utils/styling';

export const NativeToast = () => {
  // TODO@pavle: Add `close` button for toast
  const currentToast = useToastState();

  if (!currentToast || currentToast.isHandledNatively) {
    return null;
  }

  const color = getStylingColor({ ...currentToast.customData?.style });

  const style = {
    backgroundColor: `${color}-500`,
    color: `${color}-contrast`,
    borderColor: `${color}-contrast`,
  } as Record<string, ColorTokens>;

  return (
    <Toast
      key={currentToast.id}
      duration={currentToast.duration}
      viewportName={currentToast.viewportName}
      enterStyle={{ opacity: 0, scale: 0.5, y: -25 }}
      exitStyle={{ opacity: 0, scale: 1, y: -20 }}
      y={0}
      opacity={1}
      scale={1}
      transition="quick"
      backgroundColor={style.backgroundColor}
      borderColor={style.color}
      borderWidth={'$px'}
      minWidth={'$64'}
    >
      <YStack
        paddingHorizontal="$6"
        paddingVertical="$2"
        gap={'$2'}
      >
        <Toast.Title
          lineHeight="$1"
          fontWeight={500}
          color={style.color}
        >
          {currentToast.title}
        </Toast.Title>
        {!!currentToast.message && (
          <Toast.Description
            color={style.color}
            fontWeight={500}
            fontSize={'$3'}
          >
            {currentToast.message}
          </Toast.Description>
        )}
      </YStack>
    </Toast>
  );
};
