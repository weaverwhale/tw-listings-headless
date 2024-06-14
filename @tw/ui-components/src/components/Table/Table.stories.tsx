import { ThemeProvider } from '../../ThemeProvider';
import { Table } from './Table';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Table> = {
  component: Table,
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
### Table component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Table>;

const children = (
  <>
    <thead>
      <tr>
        <th>Player Name</th>
        <th>Position</th>
        <th>Goals Scored</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Mo Salah</td>
        <td>Forward</td>
        <td>173</td>
      </tr>
      <tr>
        <td>Jordan Henderson</td>
        <td>Midfielder</td>
        <td>30</td>
      </tr>
      <tr>
        <td>Virgil van Dijk</td>
        <td>Defender</td>
        <td>10</td>
      </tr>
      <tr>
        <td>Allison</td>
        <td>Goalkeeper</td>
        <td>1</td>
      </tr>
    </tbody>
  </>
);

export const Basic: Story = {
  args: {
    children,
  },
};

export const Border: Story = {
  args: {
    ...Basic.args,
    withBorder: true,
  },
};

export const Striped: Story = {
  args: {
    ...Basic.args,
    striped: true,
  },
};

export const Hover: Story = {
  args: {
    ...Basic.args,
    highlightOnHover: true,
  },
};
