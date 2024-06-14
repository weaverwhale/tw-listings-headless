import { useState } from 'react';
import { ThemeProvider } from '../../ThemeProvider';
import { MultiSelect } from './MultiSelect';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof MultiSelect> = {
  component: MultiSelect,
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
### MultiSelect component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof MultiSelect>;

export const Basic: Story = {
  args: {
    data: [
      { value: 'react', label: 'React' },
      { value: 'ng', label: 'Angular' },
      { value: 'svelte', label: 'Svelte' },
      'vue',
      { value: 'vue', label: 'Vue' },
      { value: 'vue', label: 'Vue' },
      { value: 'vue', label: 'Vue' },
      {
        group: 'fruits',
        items: [
          { value: 'vue', label: 'Vue' },
          { value: 'vue', label: 'Vue' },
          { value: 'test', label: 'Test' },
        ],
      },
    ],
  },
  render: ({ data }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState<string[]>([]);

    return <MultiSelect data={data} value={value} onChange={setValue} />;
  },
};
