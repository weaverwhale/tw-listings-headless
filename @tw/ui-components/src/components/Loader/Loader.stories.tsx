import { ThemeProvider } from '../../ThemeProvider';
import { Loader } from './Loader';

import type { Meta, StoryObj } from '@storybook/react';

// TODO: Finish story
const meta: Meta<typeof Loader> = {
  component: Loader,
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
    size: { control: 'text' },
    variant: { options: ['bars', 'oval', 'dots'] },
    color: {
      options: ['one.6', 'orange.5', 'yellow.4'],
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
### Loader component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Loader>;

export const Basic: Story = {
  args: {
    children: 'Loader',
  },
};
