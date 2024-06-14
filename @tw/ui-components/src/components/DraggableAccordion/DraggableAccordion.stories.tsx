import { ThemeProvider } from '../../ThemeProvider';
import { DraggableAccordion } from './DraggableAccordion';

import type { Meta, StoryObj } from '@storybook/react';
import { HL } from './hl';
import { HierarchicalListItem } from '../../classes/HierarchicalList';

const meta: Meta<typeof DraggableAccordion> = {
  component: DraggableAccordion,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
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
### DraggableAccordion component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof DraggableAccordion>;

export const Basic: Story = {
  args: {
    data: HL as unknown as HierarchicalListItem<string>[],
    maxDepth: 2,
  },
};
