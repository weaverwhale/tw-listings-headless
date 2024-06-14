import { ThemeProvider } from '../../ThemeProvider';
import { Navbar } from './Navbar';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Navbar> = {
  component: Navbar,
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
### Navbar component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Navbar>;

export const Basic: Story = {
  args: {
    children: 'Navbar',
  },
};
