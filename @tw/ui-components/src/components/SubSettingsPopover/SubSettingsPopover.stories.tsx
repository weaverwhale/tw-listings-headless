import { ThemeProvider } from '../../ThemeProvider';
import { SubSettingsPopover } from './SubSettingsPopover';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof SubSettingsPopover> = {
  component: SubSettingsPopover,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ width: '300px' }}>
          <Story />
        </div>
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
### SubSettingsPopover component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof SubSettingsPopover>;

export const Basic: Story = {
  args: {
    targetLabel: 'Howdy!',
    options: [
      {
        value: 'light',
        label: 'Light',
      },
      {
        value: 'dark',
        label: 'Dark',
      },
      {
        value: 'auto',
        label: 'Auto',
      },
    ],
  },
};
