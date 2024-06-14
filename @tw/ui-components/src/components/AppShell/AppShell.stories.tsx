import { ThemeProvider } from '../../ThemeProvider';
import { AppShell } from './AppShell';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof AppShell> = {
  component: AppShell,
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
### AppShell component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof AppShell>;

export const Basic: Story = {
  args: {
    children: 'AppShell',
  },
};
