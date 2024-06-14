import { ThemeProvider } from '../../ThemeProvider';
import { Collapse } from './Collapse';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Collapse> = {
  component: Collapse,
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
    in: { control: 'boolean' },
    transitionDuration: { control: 'number' },
    animateOpacity: { control: 'number' }
  },
  parameters: {
    docs: {
      description: {
        component: `
### Collapse component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Collapse>;

export const Basic: Story = {
  args: {
    children: 'Collapse',
  },
};
