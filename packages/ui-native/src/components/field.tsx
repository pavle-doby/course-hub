import * as React from "react";
import { useMemo } from "react";
import { Platform, Text as RNText, View, type ViewProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@repo/ui-native/lib/utils";
import { Label } from "@repo/ui-native/components/label";
import { Separator } from "@repo/ui-native/components/separator";
import { Text } from "@repo/ui-native/components/text";

// ---------------------------------------------------------------------------
// Context — propagates disabled / invalid state to child field components
// ---------------------------------------------------------------------------

type FieldContextValue = {
  disabled?: boolean;
  invalid?: boolean;
};

const FieldContext = React.createContext<FieldContextValue>({});

// ---------------------------------------------------------------------------
// FieldSet — replaces <fieldset>
// ---------------------------------------------------------------------------

function FieldSet({ className, ...props }: ViewProps) {
  return <View className={cn("flex flex-col gap-4", className)} {...props} />;
}

// ---------------------------------------------------------------------------
// FieldLegend — replaces <legend>
// ---------------------------------------------------------------------------

function FieldLegend({
  className,
  variant = "legend",
  ...props
}: React.ComponentProps<typeof RNText> & { variant?: "legend" | "label" }) {
  return (
    <RNText
      className={cn(
        "mb-1.5 font-medium text-foreground",
        variant === "label" ? "text-sm" : "text-base",
        className
      )}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// FieldGroup — replaces outer layout <div>
// ---------------------------------------------------------------------------

function FieldGroup({ className, ...props }: ViewProps) {
  return <View className={cn("flex w-full flex-col gap-5", className)} {...props} />;
}

// ---------------------------------------------------------------------------
// Field — replaces role="group" <div>, owns orientation + context
// ---------------------------------------------------------------------------

const fieldVariants = cva(cn("flex w-full gap-2", Platform.select({ web: "group/field" })), {
  variants: {
    orientation: {
      vertical: "flex-col",
      horizontal: "flex-row items-center",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});

function Field({
  className,
  orientation = "vertical",
  disabled,
  invalid,
  ...props
}: ViewProps &
  VariantProps<typeof fieldVariants> & {
    disabled?: boolean;
    invalid?: boolean;
  }) {
  const ctx = React.useMemo(() => ({ disabled, invalid }), [disabled, invalid]);
  return (
    <FieldContext.Provider value={ctx}>
      <View
        accessibilityRole="adjustable"
        className={cn(fieldVariants({ orientation }), invalid && "text-destructive", className)}
        {...props}
      />
    </FieldContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// FieldContent — inner layout wrapper
// ---------------------------------------------------------------------------

function FieldContent({ className, ...props }: ViewProps) {
  return <View className={cn("flex flex-1 flex-col gap-0.5", className)} {...props} />;
}

// ---------------------------------------------------------------------------
// FieldLabel — wraps native Label, inherits disabled from context
// ---------------------------------------------------------------------------

function FieldLabel({
  className,
  disabled: disabledProp,
  ...props
}: React.ComponentProps<typeof Label>) {
  const { disabled: ctxDisabled } = React.useContext(FieldContext);
  const disabled = disabledProp ?? ctxDisabled;
  return (
    <Label
      className={cn("flex gap-2", Platform.select({ web: "w-fit leading-snug" }), className)}
      disabled={disabled}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// FieldTitle — non-label heading row (replaces <div data-slot="field-label">)
// ---------------------------------------------------------------------------

function FieldTitle({ className, ...props }: ViewProps) {
  const { disabled } = React.useContext(FieldContext);
  return (
    <View
      className={cn("flex flex-row items-center gap-2", disabled && "opacity-50", className)}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// FieldDescription
// ---------------------------------------------------------------------------

function FieldDescription({ className, ...props }: React.ComponentProps<typeof RNText>) {
  return (
    <RNText
      className={cn(
        "text-left text-sm leading-normal font-normal text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// FieldSeparator
// ---------------------------------------------------------------------------

function FieldSeparator({
  children,
  className,
  ...props
}: ViewProps & { children?: React.ReactNode }) {
  return (
    <View
      className={cn("relative my-1 h-5 flex-row items-center justify-center", className)}
      {...props}
    >
      <Separator className="absolute inset-x-0 top-1/2" />
      {children != null && (
        <View className="bg-background px-2">
          <Text className="text-sm text-muted-foreground">{children as React.ReactNode}</Text>
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// FieldError
// ---------------------------------------------------------------------------

function FieldError({
  className,
  children,
  errors,
  ...props
}: ViewProps & {
  children?: React.ReactNode;
  errors?: Array<{ message?: string } | undefined>;
}) {
  const content = useMemo(() => {
    if (children) return children;
    if (!errors?.length) return null;

    const uniqueErrors = [...new Map(errors.map((error) => [error?.message, error])).values()];

    if (uniqueErrors.length === 1) {
      return uniqueErrors[0]?.message ?? null;
    }

    return uniqueErrors.map((error, index) =>
      error?.message ? (
        <RNText key={index} className="text-sm font-normal text-destructive">
          {`\u2022 ${error.message}`}
        </RNText>
      ) : null
    );
  }, [children, errors]);

  if (!content) return null;

  return (
    <View accessibilityRole="alert" className={cn("flex flex-col gap-1", className)} {...props}>
      {typeof content === "string" ? (
        <RNText className="text-sm font-normal text-destructive">{content}</RNText>
      ) : (
        content
      )}
    </View>
  );
}

export {
  Field,
  FieldContext,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
};
