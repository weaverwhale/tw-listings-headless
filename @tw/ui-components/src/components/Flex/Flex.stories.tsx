import { ThemeProvider } from '../../ThemeProvider';
import { Flex } from './Flex';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Flex> = {
  component: Flex,
  tags: ['autodocs'],
  argTypes: {
    id: { control: 'text' },
    'data-testid': { control: 'text' },
    gap: { control: 'number' },
    rowGap: { control: 'number' },
    columnGap: { control: 'number' },
    align: { options: ['flex-start', 'center', 'flex-end'] },
    justify: { options: ['flex-start', 'center', 'flex-end'] },
    direction: { options: ['row', 'column', 'row-reverse', 'column-reverse'] },
    wrap: { options: ['wrap', 'nowrap', 'wrap-reverse'] },
    children: { control: 'text' },
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
### Flex component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Flex>;

// TODO: Figure out how to show children to show functionality for flex component
export const Basic: Story = {
  args: {
    children: 'Flex',
  },
};
