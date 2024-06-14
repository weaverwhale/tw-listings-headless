import { ThemeProvider } from '../../ThemeProvider';
import { Transition } from './Transition';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Transition> = {
  component: Transition,
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
### Transition component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Transition>;

export const Basic: Story = {
  args: {
    children: () => <div>howdy</div>,
  },
};
