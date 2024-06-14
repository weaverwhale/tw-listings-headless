import { ThemeProvider } from '../../ThemeProvider';
import { Combobox } from './Combobox';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Combobox> = {
  component: Combobox,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
  argTypes: {},
  parameters: {
    docs: {
      description: {
        component: `
### Combobox component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Combobox>;

export const Basic: Story = {
  args: {
    children: 'Combobox',
  },
};
