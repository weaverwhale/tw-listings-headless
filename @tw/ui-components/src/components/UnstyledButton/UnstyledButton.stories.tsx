import { ThemeProvider } from '../../ThemeProvider';
import { UnstyledButton } from './UnstyledButton';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof UnstyledButton> = {
  component: UnstyledButton,
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
### UnstyledButton component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof UnstyledButton>;

export const Basic: Story = {
  args: {
    children: 'UnstyledButton',
  },
};
