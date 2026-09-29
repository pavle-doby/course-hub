import { View } from "react-native";
import { Button } from "@repo/ui-native/components/button";
import { FieldLabel } from "@repo/ui-native/components/field";
import { Text } from "@repo/ui-native/components/text";

type ChoiceButtonsProps<V extends string> = {
  label: string;
  value: V;
  options: { value: V; label: string }[];
  onChange: (value: V) => void;
};

/** Segmented single choice (native counterpart of the web ButtonGroup pickers). */
export function ChoiceButtons<V extends string>({
  label,
  value,
  options,
  onChange,
}: ChoiceButtonsProps<V>) {
  return (
    <View className="gap-2" accessibilityRole="radiogroup" accessibilityLabel={label}>
      <FieldLabel>{label}</FieldLabel>
      <View className="flex-row gap-2">
        {options.map((option) => (
          <Button
            key={option.value}
            className="flex-1"
            variant={value === option.value ? "default" : "outline"}
            accessibilityRole="radio"
            accessibilityState={{ checked: value === option.value }}
            onPress={() => onChange(option.value)}
          >
            <Text>{option.label}</Text>
          </Button>
        ))}
      </View>
    </View>
  );
}
