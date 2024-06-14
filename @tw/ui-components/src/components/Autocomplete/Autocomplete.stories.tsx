import { Flex } from '@mantine/core';
import { ThemeProvider } from '../../ThemeProvider';
import { Autocomplete } from './Autocomplete';

import type { Meta, StoryObj } from '@storybook/react';
import { ThemeToggle } from '../../utils/ThemeToggle';
import { useState } from 'react';

const meta: Meta<typeof Autocomplete> = {
  component: Autocomplete,
  tags: ['autodocs'],
  argTypes: {
    id: { control: 'text' },
    'data-testid': { control: 'text' },
    radius: { options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
    limit: { control: 'number' },
    maxDropdownHeight: { control: 'number' },
    data: { control: 'object' },
    placeholder: { control: 'text' },
    autoComplete: { options: ['off', 'on'] },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Flex align="center" justify="space-between" p="lg" bg="gray.4">
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
### Autocomplete component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Autocomplete>;

export const Basic: Story = {
  args: {
    data: ['React', 'Angular', 'Svelte', 'Vue'],
  },
};

export const Deduped: Story = {
  args: {
    data: [
      { value: 'react', disabled: true },
      { value: 'ng', disabled: false },
      { value: 'svelte', disabled: false },
      'vue',
      { value: 'vue', disabled: false },
      { value: 'vue', disabled: false },
      { value: 'vue', disabled: false },
      {
        group: 'fruits',
        items: [
          { value: 'react', disabled: true },
          { value: 'vue', disabled: false },
          { value: 'test', disabled: false },
        ],
      },
    ],
  },
  render: ({ data }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState<string>('');

    return <Autocomplete data={data} value={value} onChange={setValue} />;
  },
};
