import { ThemeProvider } from '../../ThemeProvider';
import { Anchor } from './Anchor';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Anchor> = {
  component: Anchor,
  tags: ['autodocs'],
  argTypes: {
    id: { control: 'text' },
    'data-testid': { control: 'text' },
    as: { options: ['a', 'button'] },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
    color: { options: ['one.6', 'orange.5', 'yellow.4'] },
    href: { control: 'text' },
    target: { options: ['_self', '_blank', '_parent', '_top'] },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
### Anchor component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Anchor>;

export const Basic: Story = {
  args: {
    children: 'Anchor',
    rightIcon: 'calculator',
    textProps: {
      // fz: 'xl'
    }
  },
};
