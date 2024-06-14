import { ThemeProvider } from '../../ThemeProvider';
import { RingProgress } from './RingProgress';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof RingProgress> = {
  component: RingProgress,
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
### RingProgress component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof RingProgress>;

export const Basic: Story = {
  args: {
    children: 'RingProgress',
    sections: [
      { value: 40, color: 'cyan' },
      { value: 15, color: 'orange' },
      { value: 15, color: 'grape' },
    ],
  },
};
