import { ThemeProvider } from '../../ThemeProvider';
import { Container } from './Container';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Container> = {
  component: Container,
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
    size: { control: 'text' },
    fluid: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component: `
### Container component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Container>;

export const Basic: Story = {
  args: {
    children: 'Container',
  },
};
