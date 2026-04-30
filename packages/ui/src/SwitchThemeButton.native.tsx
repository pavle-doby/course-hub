import { useThemeName } from 'tamagui';
import { themeNative } from 'app/utils/theme.native';
import { UIButton } from './atoms';

export const SwitchThemeButton = () => {
  const theme = useThemeName();

  return (
    <UIButton primary solid onPress={() => themeNative.toggle()}>
      {`Toggle Theme [${theme}]`}
    </UIButton>
  );
};
