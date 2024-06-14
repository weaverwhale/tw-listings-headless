import { Flex } from '@mantine/core';
import { ThemeProvider } from '../../ThemeProvider';
import { Box } from './Box';

import type { Meta, StoryObj } from '@storybook/react';
import { ThemeToggle } from '../../utils/ThemeToggle';

const meta: Meta<typeof Box> = {
  component: Box,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Flex justify="space-between">
          <Story />
          <ThemeToggle />
        </Flex>
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
### Box component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Box>;

export const Basic: Story = {
  args: {
    children: 'Box',
    as: 'p',
  },
};
