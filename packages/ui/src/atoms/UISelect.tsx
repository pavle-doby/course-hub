import { Check, ChevronDown } from '@tamagui/lucide-icons';
import { ReactNode, useEffect, useId, useMemo, useState } from 'react';
import { Select, YStack, styled, Adapt, AdaptWhen, Sheet, SelectProps } from 'tamagui';
import { UILabel } from './UILabel';
import { UIMessage } from './UIMessage';

export interface UISelectItem {
  value: string;
  content: ReactNode;
}

type UISelectProps = Omit<SelectProps, 'size'> & {
  label?: string;
  placeholder?: string;

  error?: string;
  message?: string;
  warning?: string;

  items: UISelectItem[];

  onChange: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
  onActiveChange?: (value: string, index: number) => void;
};

export function UISelect(props: UISelectProps) {
  const { label, placeholder, error, message, warning, items, value, ...other } = props;

  const [val, setVal] = useState(value);

  const id = props.id || useId();

  function handleOnValueChange(value: string) {
    setVal(value);
    return props.onChange(value);
  }

  // If the value prop changes, update the internal state
  useEffect(() => {
    if (!value) {
      return;
    }

    if (value !== val) {
      setVal(value);
    }
  }, [value]);

  return (
    <YStack>
      {/* LABEL */}
      {label && (
        <UILabel
          id={id}
          label={label}
        />
      )}

      {/* SELECT */}
      <Select
        id={id}
        value={val}
        onValueChange={handleOnValueChange}
        disablePreventBodyScroll
        {...other}
      >
        {/* TRIGGER */}
        <Trigger
          {...(error ? { borderColor: '$danger' } : {})}
          {...(warning ? { borderColor: '$warning' } : {})}
          iconAfter={ChevronDown}
        >
          <Select.Value
            fontSize={'$4'}
            placeholder={placeholder}
          />
        </Trigger>

        {/* CONTENT [WEB] */}
        <Select.Content zIndex={5}>
          <Select.Viewport
            animateOnly={['transform', 'opacity']}
            enterStyle={{ opacity: 0, y: -10 }}
            exitStyle={{ opacity: 0, y: 10 }}
            minWidth={200}
          >
            <Select.Group>
              {useMemo(
                () =>
                  items.map((item, i) => {
                    return (
                      <Item
                        index={i}
                        key={item.value + i}
                        value={item.value.toLowerCase()}
                        outlineColor={'$neutral'}
                        outlineWidth={'$0.5'}
                        outlineStyle={'solid'}
                      >
                        <Select.ItemText>{item.content}</Select.ItemText>

                        <Select.ItemIndicator marginLeft="auto">
                          <Check size={16} />
                        </Select.ItemIndicator>
                      </Item>
                    );
                  }),

                [items]
              )}
            </Select.Group>
          </Select.Viewport>
        </Select.Content>

        {/* CONTENT [NATIVE] */}
        <Adapt
          when={'sm' as unknown as AdaptWhen}
          platform="touch"
        >
          <Sheet
            modal
            dismissOnSnapToBottom
          >
            <Sheet.Frame>
              <Sheet.ScrollView>
                <Adapt.Contents />
              </Sheet.ScrollView>
            </Sheet.Frame>

            <Sheet.Overlay
              enterStyle={{ opacity: 0 }}
              exitStyle={{ opacity: 0 }}
              backgroundColor={'$neutral'}
            />
          </Sheet>
        </Adapt>
      </Select>

      {/* MESSAGES */}
      {error && <UIMessage.Danger message={error} />}
      {warning && <UIMessage.Warning message={warning} />}
      {message && <UIMessage.Message message={message} />}
    </YStack>
  );
}

/**
 * Styled `Select.Trigger`
 *
 * Style is applied with `styled` function since passing properties is not working as expected.
 */
const Trigger = styled(Select.Trigger, {
  name: 'CustomTrigger',
  backgroundColor: '$background',
  borderColor: '$borderColor',
  borderWidth: 1,
  borderRadius: '$size.2',

  variants: {
    size: {
      md: {
        height: '$10',
        fontSize: '$4',
        paddingHorizontal: '$2',
        paddingVertical: '$1',
      } as const,
    },
  },

  defaultVariants: {
    size: 'md',
  },
});

/**
 * Styled `Select.Item`
 *
 * Style is applied with `styled` function since passing properties is not working as expected.
 */
const Item = styled(Select.Item, {
  name: 'CustomItem',
  backgroundColor: '$background',
  borderColor: '$borderColor',

  hoverStyle: {
    cursor: 'pointer',
  },

  variants: {
    size: {
      md: {
        height: '$10',
        fontSize: '$4',
        paddingHorizontal: '$2',
        paddingVertical: '$1',
      } as const,
    },
  },

  defaultVariants: {
    size: 'md',
  },
});
