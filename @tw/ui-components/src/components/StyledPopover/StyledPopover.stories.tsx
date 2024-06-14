import { ThemeProvider } from '../../ThemeProvider';
import { StyledPopover } from './StyledPopover';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof StyledPopover> = {
  component: StyledPopover,
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
### StyledPopover component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof StyledPopover>;

export const Basic: Story = {
  args: {
    // children: 'StyledPopover',
    target: <div>target</div>,
    popoverLinks: [
      {
        children: <div>howdy</div>,
      },
      {
        children: <div>howdy</div>,
      },
      {
        children: <div>howdy</div>,
      },
      {
        children: <div>howdy</div>,
        topBorder: true,
      },
    ],
  },
};
