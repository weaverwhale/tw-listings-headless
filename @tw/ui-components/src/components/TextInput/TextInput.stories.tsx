import { Group } from '@mantine/core';
import { ThemeProvider } from '../../ThemeProvider';
import { TextInput } from './TextInput';

import type { Meta, StoryObj } from '@storybook/react';
import { ThemeToggle } from '../../utils/ThemeToggle';
import { Grow } from '..';

const meta: Meta<typeof TextInput> = {
  component: TextInput,
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
  parameters: {
    docs: {
      description: {
        component: `
### TextInput component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof TextInput>;

export const Basic: Story = {
  args: {
    //fz: 'md',
    // bg: 'red.8'
  },
};
