import { Button } from "@repo/ui-native/components/button";
import { Icon } from "@repo/ui-native/components/icon";
import { Input } from "@repo/ui-native/components/input";
import { Text } from "@repo/ui-native/components/text";
import { cn } from "@repo/ui-native/lib/utils";
import { CheckIcon } from "lucide-react-native";
import * as React from "react";
import { Pressable, View, type ViewProps } from "react-native";

/**
 * Step-by-step questionnaire, the native counterpart of `@repo/ui-web/components/questionnaire`
 * (same parts and behavior, without the web primitive's `<form>` / DOM). The Root owns the
 * answers: `items` defines order, `required` and `multiple`, and `onSubmit` receives the answers.
 *
 * - One item is shown at a time; Previous / Next move between them.
 * - An item is valid when answered, or skipped when optional. Next and Submit validate; the
 *   error shows only after a failed attempt.
 * - Skip (optional items only) clears the answer; on the last item it submits.
 * - Submit validates every item and jumps to the first invalid one.
 */

type QuestionnaireItemDefinition = {
  name: string;
  required?: boolean;
  multiple?: boolean;
};

type QuestionnaireItemStatus = "unanswered" | "answered" | "skipped";

/** Answered, non-skipped items: choice values, or the trimmed text for an input. */
type QuestionnaireAnswers = Record<string, string[]>;

type RootContextValue = {
  items: readonly QuestionnaireItemDefinition[];
  current: number;
  total: number;
  first: boolean;
  last: boolean;
  answers: QuestionnaireAnswers;
  statusOf: (name: string) => QuestionnaireItemStatus;
  isInvalid: (name: string) => boolean;
  setAnswer: (name: string, values: string[]) => void;
  goPrevious: () => void;
  goNext: () => void;
  skipCurrent: () => void;
  submit: () => void;
};

const RootContext = React.createContext<RootContextValue | null>(null);

function useRootContext(part: string) {
  const context = React.useContext(RootContext);
  if (!context) {
    throw new Error(`Questionnaire.${part} must be used within <Questionnaire>`);
  }
  return context;
}

type ItemContextValue = QuestionnaireItemDefinition & {
  status: QuestionnaireItemStatus;
  invalid: boolean;
  values: string[];
  setValues: (values: string[]) => void;
};

const ItemContext = React.createContext<ItemContextValue | null>(null);

function useItemContext(part: string) {
  const context = React.useContext(ItemContext);
  if (!context) {
    throw new Error(`Questionnaire.${part} must be used within <QuestionnaireItem>`);
  }
  return context;
}

function isAnswered(values: string[] | undefined) {
  return !!values?.some((value) => value.trim().length > 0);
}

function Questionnaire({
  items,
  onSubmit,
  onChange,
  className,
  ...props
}: ViewProps & {
  items: readonly QuestionnaireItemDefinition[];
  onSubmit: (answers: QuestionnaireAnswers) => void;
  /** Called whenever an answer changes. */
  onChange?: () => void;
}) {
  const [index, setIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<QuestionnaireAnswers>({});
  const [skipped, setSkipped] = React.useState<ReadonlySet<string>>(new Set());
  const [attempted, setAttempted] = React.useState<ReadonlySet<string>>(new Set());

  const total = items.length;
  const current = Math.min(index, Math.max(total - 1, 0));
  const activeItem = items[current];

  function statusOf(name: string): QuestionnaireItemStatus {
    if (skipped.has(name)) {
      return "skipped";
    }
    return isAnswered(answers[name]) ? "answered" : "unanswered";
  }

  function isValid(item: QuestionnaireItemDefinition) {
    const status = statusOf(item.name);
    return status === "answered" || (status === "skipped" && !item.required);
  }

  function isInvalid(name: string) {
    const item = items.find((candidate) => candidate.name === name);
    return !!item && attempted.has(name) && !isValid(item);
  }

  function markAttempted(names: string[]) {
    setAttempted((previous) => new Set([...previous, ...names]));
  }

  function setAnswer(name: string, values: string[]) {
    setAnswers((previous) => ({ ...previous, [name]: values }));
    setSkipped((previous) => {
      if (!previous.has(name)) {
        return previous;
      }
      const next = new Set(previous);
      next.delete(name);
      return next;
    });
    onChange?.();
  }

  function collectAnswers(skippedNames: ReadonlySet<string>) {
    const result: QuestionnaireAnswers = {};
    for (const item of items) {
      const values = (answers[item.name] ?? []).map((value) => value.trim()).filter(Boolean);
      if (!skippedNames.has(item.name) && values.length) {
        result[item.name] = values;
      }
    }
    return result;
  }

  function goPrevious() {
    setIndex(Math.max(current - 1, 0));
  }

  function goNext() {
    if (!activeItem || current >= total - 1) {
      return;
    }
    if (!isValid(activeItem)) {
      markAttempted([activeItem.name]);
      return;
    }
    setIndex(current + 1);
  }

  function submit(skippedNames: ReadonlySet<string> = skipped) {
    const firstInvalidIndex = items.findIndex((item) => {
      const status = skippedNames.has(item.name)
        ? "skipped"
        : isAnswered(answers[item.name])
          ? "answered"
          : "unanswered";
      return !(status === "answered" || (status === "skipped" && !item.required));
    });
    if (firstInvalidIndex >= 0) {
      markAttempted([items[firstInvalidIndex]!.name]);
      setIndex(firstInvalidIndex);
      return;
    }
    onSubmit(collectAnswers(skippedNames));
  }

  function skipCurrent() {
    if (!activeItem || activeItem.required) {
      return;
    }
    const nextSkipped = new Set([...skipped, activeItem.name]);
    setSkipped(nextSkipped);
    setAnswers((previous) => ({ ...previous, [activeItem.name]: [] }));
    if (current < total - 1) {
      setIndex(current + 1);
    } else {
      submit(nextSkipped);
    }
  }

  const context: RootContextValue = {
    items,
    current: total ? current + 1 : 0,
    total,
    first: current === 0,
    last: total > 0 && current === total - 1,
    answers,
    statusOf,
    isInvalid,
    setAnswer,
    goPrevious,
    goNext,
    skipCurrent,
    submit: () => submit(),
  };

  return (
    <RootContext.Provider value={context}>
      <View className={cn("w-full min-w-0 flex-col gap-4", className)} {...props} />
    </RootContext.Provider>
  );
}

function QuestionnaireProgress({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Text>) {
  const { current, total } = useRootContext("Progress");
  const label = total ? `Question ${current} of ${total}` : undefined;

  return (
    <Text
      accessibilityRole="progressbar"
      accessibilityLiveRegion="polite"
      accessibilityValue={total ? { min: 1, max: total, now: current, text: label } : undefined}
      className={cn("text-xs font-medium text-muted-foreground tabular-nums", className)}
      {...props}
    >
      {children ?? label}
    </Text>
  );
}

function QuestionnaireItem({ name, className, ...props }: ViewProps & { name: string }) {
  const root = useRootContext("Item");
  const definition = root.items.find((item) => item.name === name);
  const isActive = root.items[root.current - 1]?.name === name;

  if (!definition || !isActive) {
    return null;
  }

  const itemContext: ItemContextValue = {
    ...definition,
    status: root.statusOf(name),
    invalid: root.isInvalid(name),
    values: root.answers[name] ?? [],
    setValues: (values) => root.setAnswer(name, values),
  };

  return (
    <ItemContext.Provider value={itemContext}>
      <View className={cn("min-w-0 flex-col gap-4", className)} {...props} />
    </ItemContext.Provider>
  );
}

function QuestionnaireTitle({ className, ...props }: React.ComponentProps<typeof Text>) {
  return (
    <Text
      role="heading"
      className={cn("text-base leading-snug font-medium", className)}
      {...props}
    />
  );
}

function QuestionnaireDescription({ className, ...props }: React.ComponentProps<typeof Text>) {
  return <Text className={cn("-mt-2 text-sm text-muted-foreground", className)} {...props} />;
}

function QuestionnaireChoices({ className, ...props }: ViewProps) {
  const { multiple } = useItemContext("Choices");
  return (
    <View
      accessibilityRole={multiple ? undefined : "radiogroup"}
      className={cn("min-w-0 gap-2", className)}
      {...props}
    />
  );
}

function QuestionnaireChoice({
  value,
  disabled,
  children,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Pressable>, "children"> & {
  value: string;
  children?: React.ReactNode;
}) {
  const item = useItemContext("Choice");
  const checked = item.values.includes(value);

  function handlePress() {
    if (item.multiple) {
      item.setValues(
        checked ? item.values.filter((selected) => selected !== value) : [...item.values, value]
      );
    } else if (!checked) {
      item.setValues([value]);
    }
  }

  return (
    <Pressable
      accessibilityRole={item.multiple ? "checkbox" : "radio"}
      accessibilityState={{ checked, disabled: !!disabled }}
      disabled={disabled}
      onPress={handlePress}
      className={cn(
        "min-h-11 flex-row items-start gap-2.5 rounded-lg border border-input px-3 py-2.5 active:bg-muted/50 dark:bg-input/20",
        checked && "border-primary/40 bg-muted dark:bg-muted",
        item.invalid && "border-destructive",
        disabled && "opacity-50",
        className
      )}
      {...props}
    >
      <View
        className={cn(
          "mt-0.5 size-4 shrink-0 items-center justify-center border border-input dark:bg-input/30",
          item.multiple ? "rounded-[4px]" : "rounded-full",
          checked && "border-primary bg-primary dark:bg-primary"
        )}
      >
        {checked &&
          (item.multiple ? (
            <Icon as={CheckIcon} size={14} className="text-primary-foreground" />
          ) : (
            <View className="size-2 rounded-full bg-primary-foreground" />
          ))}
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        {typeof children === "string" ? (
          <Text className="text-sm leading-snug">{children}</Text>
        ) : (
          children
        )}
      </View>
    </Pressable>
  );
}

function QuestionnaireChoiceDescription({
  className,
  ...props
}: React.ComponentProps<typeof Text>) {
  return <Text className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

function QuestionnaireInput({
  className,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "value" | "onChangeText">) {
  const item = useItemContext("Input");

  return (
    <Input
      value={item.values[0] ?? ""}
      onChangeText={(text) => item.setValues([text])}
      className={cn("min-h-11 rounded-lg", item.invalid && "border-destructive", className)}
      {...props}
    />
  );
}

function QuestionnaireError({ className, children, ...props }: React.ComponentProps<typeof Text>) {
  const item = useItemContext("Error");

  if (!item.invalid) {
    return null;
  }

  return (
    <Text
      role="alert"
      accessibilityLiveRegion="polite"
      className={cn("text-sm text-destructive", className)}
      {...props}
    >
      {children ??
        (item.required
          ? "Choose an answer to continue."
          : "Choose an answer or skip this question.")}
    </Text>
  );
}

function QuestionnaireActions({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn("min-h-11 w-full flex-row items-center justify-end gap-2", className)}
      {...props}
    />
  );
}

type NavigationButtonProps = Omit<React.ComponentProps<typeof Button>, "children" | "onPress"> & {
  children?: React.ReactNode;
};

function NavigationButton({
  visible,
  onPress,
  children,
  ...props
}: NavigationButtonProps & { visible: boolean; onPress: () => void }) {
  if (!visible) {
    return null;
  }
  return (
    <Button onPress={onPress} {...props}>
      {typeof children === "string" ? <Text>{children}</Text> : children}
    </Button>
  );
}

function QuestionnairePrevious({
  children = "Previous",
  variant = "outline",
  className,
  ...props
}: NavigationButtonProps) {
  const { total, first, goPrevious } = useRootContext("Previous");
  return (
    <NavigationButton
      visible={total > 1 && !first}
      onPress={goPrevious}
      variant={variant}
      className={cn("mr-auto", className)}
      {...props}
    >
      {children}
    </NavigationButton>
  );
}

function QuestionnaireSkip({
  children = "Skip",
  variant = "outline",
  className,
  ...props
}: NavigationButtonProps) {
  const { items, current, skipCurrent } = useRootContext("Skip");
  const activeItem = items[current - 1];
  return (
    <NavigationButton
      visible={!!activeItem && !activeItem.required}
      onPress={skipCurrent}
      variant={variant}
      className={className}
      {...props}
    >
      {children}
    </NavigationButton>
  );
}

function QuestionnaireNext({ children = "Next", className, ...props }: NavigationButtonProps) {
  const { total, last, goNext } = useRootContext("Next");
  return (
    <NavigationButton
      visible={total > 1 && !last}
      onPress={goNext}
      className={className}
      {...props}
    >
      {children}
    </NavigationButton>
  );
}

function QuestionnaireSubmit({ children = "Submit", className, ...props }: NavigationButtonProps) {
  const { total, last, submit } = useRootContext("Submit");
  return (
    <NavigationButton visible={total > 0 && last} onPress={submit} className={className} {...props}>
      {children}
    </NavigationButton>
  );
}

export {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
};
export type { QuestionnaireAnswers, QuestionnaireItemDefinition, QuestionnaireItemStatus };
