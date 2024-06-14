import { Group } from '../Group/Group';
import { ThemeProvider } from '../../ThemeProvider';
import { Button } from './Button';
import type { Meta, StoryObj } from '@storybook/react';
import { ThemeToggle } from '../../utils/ThemeToggle';

const meta: Meta<typeof Button> = {
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    id: { control: 'text' },
    'data-testid': { control: 'text' },
    // type: { control: 'text' },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
    radius: { options: ['default', 'round'] },
    variant: {
      options: ['primary', 'secondary', 'white', 'gradient', 'activator', 'danger', 'warning'],
    },
    forceColorScheme: { options: ['undefined', 'dark', 'light'] },
    size: {
      options: [
        'xs',
        'sm',
        'md',
        'lg',
        'xl',
        'compact-xs',
        'compact-sm',
        'compact-md',
        'compact-lg',
        'compact-xl',
      ],
    },
    color: {
      options: ['one.6', 'orange.5', 'yellow.4'],
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Group justify="space-between">
          <Story />
          <ThemeToggle />
        </Group>
      </ThemeProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
### Button component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    leftSection: 'check-thin',
    variant: 'primary',
    color: 'one.5',
    radius: 'default',
  },
};

export const Secondary: Story = {
  args: {
    leftSection: 'check-thin',
    variant: 'secondary',
    color: 'one.5',
    radius: 'default',
  },
};

export const Activator: Story = {
  args: {
    leftSection: 'check-thin',
    variant: 'activator',
    color: 'one.5',
    radius: 'default',
  },
};

export const White: Story = {
  args: {
    leftSection: 'check-thin',
    variant: 'white',
    color: 'one.5',
    radius: 'default',
  },
};

export const Gradient: Story = {
  args: {
    leftSection: 'check-thin',
    variant: 'gradient',
    color: 'one.5',
    radius: 'default',
  },
};

export const Danger: Story = {
  args: {
    leftSection: 'check-thin',
    variant: 'danger',
    color: 'one.5',
    radius: 'default',
  },
};

export const Warning: Story = {
  args: {
    leftSection: 'check-thin',
    variant: 'warning',
    color: 'one.5',
    radius: 'default',
  },
};
