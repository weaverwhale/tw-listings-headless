import { Group } from '..';
import { ThemeProvider } from '../../ThemeProvider';
import { ThemeToggle } from '../../utils/ThemeToggle';
import { NavSectionIcon } from './NavSectionIcon';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof NavSectionIcon> = {
  component: NavSectionIcon,
  tags: ['autodocs'],
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
  argTypes: {
    // id: { control: 'text' },
    // 'data-testid': { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component: `
### NavSectionIcon component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof NavSectionIcon>;

export const Basic: Story = {
  args: {
    // children: 'NavSectionIcon',
  },
};
