import { View } from "react-native";
import { SearchIcon } from "lucide-react-native";
import { Icon } from "@repo/ui-native/components/icon";
import { Input } from "@repo/ui-native/components/input";

type SearchInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
};

export function SearchInput({ value, onChangeText, placeholder }: SearchInputProps) {
  return (
    <View className="justify-center">
      <Icon
        as={SearchIcon}
        size={16}
        className="absolute left-2.5 z-10 text-muted-foreground"
        pointerEvents="none"
      />
      <Input
        className="pl-8"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        accessibilityLabel={placeholder}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
    </View>
  );
}
