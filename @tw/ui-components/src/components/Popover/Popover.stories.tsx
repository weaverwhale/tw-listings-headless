import { Flex } from '@mantine/core';
import { ThemeProvider } from '../../ThemeProvider';
import { ThemeToggle } from '../../utils/ThemeToggle';
import { Box } from '../Box/Box';
import { Button } from '../Button/Button';
import { Stack } from '../Stack/Stack';
import { Popover } from './Popover';

import type { Meta, StoryObj } from '@storybook/react';

const PopoverStory = () => {
  return (
    <ThemeProvider>
      <Flex justify="space-between" style={{ minHeight: '300px' }}>
        <Popover>
          <Popover.Target>
            <Button variant="primary">Click me to open!!</Button>
          </Popover.Target>
          <Popover.Dropdown bg="white">
            <Stack>
              {['one', 'two', 'three'].map((el) => {
                return (
                  <Box p="xs" key={el}>
                    {el}
                  </Box>
                );
              })}
            </Stack>
          </Popover.Dropdown>
        </Popover>
        <ThemeToggle />
      </Flex>
    </ThemeProvider>
  );
};

const meta: Meta<typeof PopoverStory> = {
  component: PopoverStory,
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
    // 'data-testid': { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component: `
### Popover component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Popover>;

export const Basic: Story = {
  args: {
    children: 'Popover',
  },
};
