import { ThemeProvider } from '../../ThemeProvider';
import { QuantityDecorator } from './QuantityDecorator';

import type { Meta, StoryObj } from '@storybook/react';

import { Image } from '../Image/Image';

const meta: Meta<typeof QuantityDecorator> = {
  component: QuantityDecorator,
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
### QuantityDecorator component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof QuantityDecorator>;

export const Basic: Story = {
  args: {
    children: (
      <Image
        w={100}
        shadowBorderSize={'sm'}
        src={
          'https://cdn.shopify.com/s/files/1/2148/9535/products/HTSAH_94e98c77-5ff6-4ab5-b32a-905a6fbf32cb.jpg?v=1591205882'
        }
      />
    ),
    quantity: 2,
  },
};
