import { ThemeProvider } from '../../ThemeProvider';
import { UserSettingsPopover } from './UserSettingsPopover';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof UserSettingsPopover> = {
  component: UserSettingsPopover,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
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
### UserSettingsPopover component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof UserSettingsPopover>;

export const Basic: Story = {
  args: {
    avatarSource: '',
    initials: 'YS',
    targetSize: 'lg',
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
