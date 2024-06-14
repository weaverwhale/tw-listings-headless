import { Group } from '@mantine/core';
import { ThemeProvider } from '../../ThemeProvider';
import { ThemeToggle } from '../../utils/ThemeToggle';
import { Text } from './Text';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Text> = {
  component: Text,
  tags: ['autodocs'],
  argTypes: {
    id: { control: 'text' },
    'data-testid': { control: 'text' },
    as: { options: ['p', 'div', 'legend', 'span'] },
    color: {
      options: ['one.6', 'orange.5', 'yellow.4'],
    },
    c: {
      options: ['red.6', 'green.5', 'gray.4'],
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Group justify="space-between">
          <Story />
          <ThemeToggle />
        </Group>
      </ThemeProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
### Text component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Text>;

export const Basic: Story = {
  args: {
    children:
      'Hello World fqe;fkawdj;sfkajsd;kfjas;dkfja;sldkfj;alskdjf;laksdjf;laksdjf;lkasjd;lfkajs;dlkfja;lskdfj;alksdjf;alksdjf;alksdfj',
    fz: 'md',
    // eslint-disable-next-line no-constant-condition
    c: false ? 'gray.5' : false ? 'gray.7' : 'gray.8',
  },
};

export const Legend: Story = {
  args: {
    children: 'Hello World',
    fz: 'md',
    as: 'legend',
  },
};

export const Paragraph: Story = {
  args: {
    children: 'Hello World',
    fz: 'md',
    as: 'p',
  },
};
