import { Flex } from '@mantine/core';
import { ThemeProvider } from '../../ThemeProvider';
import { ThemeToggle } from '../../utils/ThemeToggle';
import { Switch } from './Switch';

import type { Meta, StoryObj } from '@storybook/react';
import { useDisclosure } from '../..';

const meta: Meta<typeof Switch> = {
  component: Switch,
  tags: ['autodocs'],
  argTypes: {
    id: { control: 'text' },
    'data-testid': { control: 'text' },
    size: { control: 'text' },
    variant: { control: 'select', options: ['simple', 'short'] },
    color: {
      options: ['one.6', 'orange.5', 'yellow.4'],
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Flex justify="space-between" bg="named.0" p="md">
          <Story />
          <ThemeToggle />
        </Flex>
      </ThemeProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
### Text component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Switch>;

export const Basic: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [checked, { toggle }] = useDisclosure(false);

    return (
      <Switch
        label="hey"
        onColor="one.9"
        offColor="named.7"
        variant="simple"
        withOutline
        onChange={toggle}
        checked={checked}
      />
    );
  },
};
