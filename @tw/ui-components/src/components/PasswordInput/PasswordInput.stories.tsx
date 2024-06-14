import { Group } from '@mantine/core';
import { ThemeProvider } from '../../ThemeProvider';
import { PasswordInput } from './PasswordInput';

import type { Meta, StoryObj } from '@storybook/react';
import { ThemeToggle } from '../../utils/ThemeToggle';
import { Grow } from '..';

const meta: Meta<typeof PasswordInput> = {
  component: PasswordInput,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Group>
          <Grow>
            <Story />
          </Grow>
          <ThemeToggle />
        </Group>
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
### PasswordInput component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof PasswordInput>;

export const Basic: Story = {
  args: {},
};
