import { Group } from '../Group/Group';
import { ThemeProvider } from '../../ThemeProvider';
import { Checkbox } from './Checkbox';

import type { Meta, StoryObj } from '@storybook/react';
import { ThemeToggle } from '../../utils/ThemeToggle';

const meta: Meta<typeof Checkbox> = {
  component: Checkbox,
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
### Checkbox component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Basic: Story = {
  args: {
    label: 'Checkbox item',
  },
};

export const Checked: Story = {
  args: {
    ...Basic.args,
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    ...Basic.args,
    disabled: true,
  },
};

export const Indeterminate: Story = {
  args: {
    ...Basic.args,
    indeterminate: true,
  },
};

export const Invalid: Story = {
  args: {
    ...Basic.args,
    wrapperProps: {
      withAsterisk: true,
    },
    checked: false,
    error: 'You should check this',
  },
};

// export const LongTransition: Story = {
//   args: {
//     ...Basic.args,
//     transitionDuration: 1000,
//   },
// };
