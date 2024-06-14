import { ThemeProvider } from '../../ThemeProvider';
import { Title } from './Title';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Title> = {
  component: Title,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
### Title component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Title>;

export const Basic: Story = {
  args: {
    children: 'Title',
  },
};
