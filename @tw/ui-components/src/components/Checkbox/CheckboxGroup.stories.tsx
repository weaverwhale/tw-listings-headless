import { useState, useEffect } from 'react';
import { ThemeProvider } from '../../ThemeProvider';
import { Checkbox } from './Checkbox';
import { Stack } from '../Stack/Stack';

import type { Meta, StoryObj } from '@storybook/react';
import { Group } from '../Group/Group';
import { ThemeToggle } from '../../utils/ThemeToggle';

// const includesAll = (array: any[], values: any[]) => {
//   return values.every((value) => array.includes(value));
// };

// const includesAny = (array: any[], values: any[]) => {
//   return values.some((value) => array.includes(value));
// };

const ControlledCheckboxGroup = () => {
  const [checked, setChecked] = useState<string[]>([]);
  const [allChecked, setAllChecked] = useState(false);
  const [anyChecked, setAnyChecked] = useState(false);

  useEffect(() => {
    if (checked.length === 3) {
      setAllChecked(true);
    } else {
      setAllChecked(false);
    }
  }, [checked]);

  useEffect(() => {
    if (checked.length > 0) {
      setAnyChecked(true);
    } else {
      setAnyChecked(false);
    }
  }, [checked]);

  return (
    <Stack>
      <Checkbox
        label="Select All"
        value="all"
        checked={allChecked}
        indeterminate={anyChecked && !allChecked}
        onChange={(isOn) => {
          if (isOn) {
            setChecked(['steak', 'chicken', 'fish']);
          } else {
            setChecked([]);
          }
        }}
      />
      <Checkbox.Group
        value={checked}
        onChange={(val) => {
          setChecked(val);
        }}
      >
        <Stack gap="md" pl="md">
          <Checkbox label="Steak" value="steak" />
          <Checkbox label="Chicken" value="chicken" />
          <Checkbox label="Fish" value="fish" />
        </Stack>
      </Checkbox.Group>
    </Stack>
  );
};

const meta: Meta<typeof ControlledCheckboxGroup> = {
  component: ControlledCheckboxGroup,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Group justify="space-between">
          <Story />
          <ThemeToggle />
        </Group>
      </ThemeProvider>
    ),
  ],
  argTypes: {
    id: { control: 'text' },
    'data-testid': { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component: `
### Checkbox.Group component

Provides a wrapper around multiple Checkbox components.

Use to write controlled checkbox groups (think \`Select All\` or nested checkbox sections).
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof ControlledCheckboxGroup>;

export const Basic: Story = {
  args: {},
};
