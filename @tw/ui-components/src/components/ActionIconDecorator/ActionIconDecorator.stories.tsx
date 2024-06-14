import { Image } from '..';
import { ThemeProvider } from '../../ThemeProvider';
import { ActionIconDecorator } from './ActionIconDecorator';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof ActionIconDecorator> = {
  component: ActionIconDecorator,
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
### ActionIconDecorator component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof ActionIconDecorator>;

export const Basic: Story = {
  args: {
    children: <Image src='https://cdn.shopify.com/s/files/1/2148/9535/products/HTSAH_94e98c77-5ff6-4ab5-b32a-905a6fbf32cb.jpg?v=1591205882' w={80} />,
    position: 'bottom',
    actionIconProps: {
      icon: 'delete',
      size: 'xs',
      onClick: () => alert('action icon clicked'),
    },
  },
};
