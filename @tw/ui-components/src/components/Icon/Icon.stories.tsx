import { ThemeProvider } from '../../ThemeProvider';
import { icons as ICONS } from '../../constants/icons';
import { Icon } from './Icon';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Icon> = {
  component: Icon,
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
    height: { control: 'number' },
    width: { control: 'number' },
    size: { control: 'number' },
    name: { control: { type: 'select' }, options: ICONS },
    color: { control: { type: 'select' }, options: ['one.7', 'orange.5', 'red.5'] },
  },
  parameters: {
    docs: {
      description: {
        component: `
### Icon component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Icon>;

export const Basic: Story = {
  args: {
    name: undefined,
  },
};
