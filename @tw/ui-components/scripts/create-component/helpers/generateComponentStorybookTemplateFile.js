module.exports.generateComponentStorybookTemplateFile = (componentName) => {
  return `import { ThemeProvider } from '../../ThemeProvider';
import { ${componentName} } from './${componentName}';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof ${componentName}> = {
  component: ${componentName},
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
        component: \`
### ${componentName} component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
\`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof ${componentName}>;

export const Basic: Story = {
  args: {
    children: '${componentName}',
  },
};
`;
};
