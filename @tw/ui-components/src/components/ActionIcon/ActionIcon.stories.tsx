import type { Meta, StoryObj } from '@storybook/react';
import { ThemeProvider } from '../../ThemeProvider';
import { ActionIcon } from './ActionIcon';
import { icons as ICONS } from '../../constants/icons';
import { ThemeToggle } from '../../utils/ThemeToggle';
import { Group } from '../Group/Group';

// TODO: Finish story
const meta: Meta<typeof ActionIcon> = {
  component: ActionIcon,
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
    size: { options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    radius: { options: ['xs', 'sm', 'md', 'lg', 'xl', 'round'] },
    disabled: { control: 'boolean' },
    variant: {
      options: [
        'activator',
        'subtle',
        'filled',
        'outline',
        'light',
        'default',
        'transparent',
        'gradient',
      ],
    },
    icon: { control: { type: 'select' }, options: ICONS },
    outline: { control: 'boolean' },
    color: { options: ['one.6', 'orange.5', 'yellow.4', 'gray.7'] },
    iconColor: { options: ['one.6', 'orange.5', 'yellow.4', 'gray.7'] },
  },
  parameters: {
    docs: {
      description: {
        component: `
### ActionIcon component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof ActionIcon>;

export const Default: Story = {
  args: {
    icon: 'check-thin',
    variant: 'default',
    // color: 'one.5',
    radius: 'xs',
  },
  render: (props) => {
    return (
      <Group justify="space-between">
        <ActionIcon {...props} onClick={() => {}} />
        <ThemeToggle />
      </Group>
    );
  },
};
export const Activator: Story = {
  args: {
    icon: 'check-thin',
    variant: 'activator',
    color: 'one.5',
    radius: 'xs',
  },
  render: (props) => {
    return (
      <Group justify="space-between">
        <ActionIcon {...props} onClick={() => {}} />
        <ThemeToggle />
      </Group>
    );
  },
};
