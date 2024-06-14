import { ThemeProvider } from '../../ThemeProvider';
import { Nav } from './Nav';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Nav> = {
  component: Nav,
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
### Nav component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Nav>;

export const Basic: Story = {
  args: {
    children: 'Nav',
  },
};
