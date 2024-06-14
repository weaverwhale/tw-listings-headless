import { ThemeProvider } from '../../ThemeProvider';
import { Grid } from './Grid';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Grid> = {
  component: Grid,
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
### Grid component

This description is written using markdown.
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Grid>;

export const Basic: Story = {
  args: {
    children: 'Grid',
  },
};

export const Columns: Story = {
  args: {
    gutterLg: 'xl',
    children: [
      <Grid.Col span={2} bg="one.2">
        something
      </Grid.Col>,
      <Grid.Col span={4} bg="two.3">
        something
      </Grid.Col>,
      <Grid.Col span={1} bg="green.2">
        something
      </Grid.Col>,
    ],
  },
};

// import { Grid } from '@mantine/core';
// import { ThemeProvider } from '../../ThemeProvider';
// // import { Grid } from './Grid';

// import type { Meta, StoryObj } from '@storybook/react';

// const AdvancedGridStory = () => {
//   return (
//     <Grid w={300} h={400} bg="yellow.4">
//       <Grid.Col sm="content" md="" bg="orange.4">
//         Something here
//       </Grid.Col>
//       <Grid.Col sm="auto" md="" bg="one.4">
//         Something here
//       </Grid.Col>
//       <Grid.Col sm={50} md="" bg="green.4">
//         Something here
//       </Grid.Col>
//     </Grid>
//   );
// };

// const meta: Meta<typeof AdvancedGridStory> = {
//   component: AdvancedGridStory,
//   tags: ['autodocs'],
//   decorators: [
//     (Story) => (
//       <ThemeProvider>
//         <Story />
//       </ThemeProvider>
//     ),
//   ],
//   argTypes: {
//     id: { control: 'text' },
//     'data-testid': { control: 'text' },
//   },
//   parameters: {
//     docs: {
//       description: {
//         component: `
// ### AdvancedGrid component

// This description is written using markdown.
// Go ahead, poke around and see what you can do.
// You have the power to change the world.
// `,
//       },
//     },
//   },
// };

// export default meta;

// type Story = StoryObj<typeof AdvancedGridStory>;

// export const Basic: Story = {
//   args: {},
// };
