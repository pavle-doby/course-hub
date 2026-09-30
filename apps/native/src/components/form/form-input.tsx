import { useId, useState } from "react";
import { Pressable, View, type TextInputProps } from "react-native";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { EyeIcon, EyeOffIcon } from "lucide-react-native";
import { useTranslation } from "@repo/i18n/native";
import { Field, FieldError, FieldLabel } from "@repo/ui-native/components/field";
import { Icon } from "@repo/ui-native/components/icon";
import { Input } from "@repo/ui-native/components/input";

type FormInputProps<T extends FieldValues> = Omit<TextInputProps, "value" | "onChangeText"> & {
  control: Control<T>;
  name: Path<T>;
  label: string;
  /** Adds a show/hide toggle and hides the text by default. */
  password?: boolean;
};

/** Label + input + error for a react-hook-form field (RN has no `register`). */
export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  password,
  ...inputProps
}: FormInputProps<T>) {
  const labelId = useId();
  const { t } = useTranslation();
  const [hidden, setHidden] = useState(true);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
        <Field>
          <FieldLabel nativeID={labelId}>{label}</FieldLabel>
          <View className="justify-center">
            <Input
              aria-labelledby={labelId}
              value={value ?? ""}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry={password && hidden}
              className={password ? "pr-10" : undefined}
              {...inputProps}
            />
            {password && (
              <Pressable
                className="absolute right-0 h-full justify-center px-3"
                accessibilityRole="button"
                accessibilityLabel={
                  hidden ? t("auth.login.showPassword") : t("auth.login.hidePassword")
                }
                onPress={() => setHidden((v) => !v)}
              >
                <Icon as={hidden ? EyeIcon : EyeOffIcon} className="size-4 text-muted-foreground" />
              </Pressable>
            )}
          </View>
          <FieldError errors={[error]} />
        </Field>
      )}
    />
  );
}
