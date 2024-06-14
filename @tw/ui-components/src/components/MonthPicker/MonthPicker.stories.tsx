import { ThemeProvider } from '../../ThemeProvider';
import { MonthPicker } from './MonthPicker';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof MonthPicker> = {
  component: MonthPicker,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
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
### MonthPicker component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof MonthPicker>;

export const Basic: Story = {
  args: {},
};
