import { Group } from '@mantine/core';
import { ThemeProvider } from '../../ThemeProvider';
import { List } from './List';

import type { Meta, StoryObj } from '@storybook/react';
import { ThemeToggle } from '../../utils/ThemeToggle';

const meta: Meta<typeof List> = {
  component: List,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Group justify="space-between" bg="named.0">
          <Story />
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
### List component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof List>;

export const Basic: Story = {
  args: {
    children: [
      <List.Item>howdy</List.Item>,
      <List.Item>howdy</List.Item>,
      <List.Item>howdy</List.Item>,
      <List.Item>howdy</List.Item>,
    ],
  },
};
