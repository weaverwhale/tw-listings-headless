import { ThemeProvider } from '../../ThemeProvider';
import { Alert } from './Alert';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Alert> = {
  component: Alert,
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
### Alert component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Alert>;

export const Basic: Story = {
  args: {
    children: 'Alert',
  },
};
