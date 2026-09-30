import { cssInterop } from "nativewind";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

// NativeWind only maps `className` on core RN components; third-party ones need `cssInterop`.
cssInterop(KeyboardAwareScrollView, {
  className: "style",
  contentContainerClassName: "contentContainerStyle",
});

export { KeyboardAwareScrollView };
