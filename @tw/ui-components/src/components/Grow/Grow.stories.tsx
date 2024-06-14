import { ThemeProvider } from '../../ThemeProvider';
import { Flex } from '../Flex/Flex';
import { Grow } from './Grow';

import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '../Box/Box';
import { Title } from '../Title/Title';

const meta: Meta<typeof Grow> = {
  component: Grow,
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
### Grow component

Box B has a flex-grow of 1, adjusting the grow prop will change Box A.
`,
      },
    },
  },
  render: (args) => (
    <Box p="md">
      <Title mb="sm">Grow</Title>
      <Flex h="90vh" gap="md">
        <Grow {...args}>
          <Box p="md" borderRadius="6px" bg="red.4">
            A
          </Box>
        </Grow>
        <Grow grow={1}>
          <Box p="md" borderRadius="6px" bg="one.4">
            B (flex-grow = 1)
          </Box>
        </Grow>
      </Flex>
    </Box>
  ),
};

export default meta;

type Story = StoryObj<typeof Grow>;

export const Basic: Story = {
  args: {
    grow: 1,
  },
};
