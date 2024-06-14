import { Button, Icon } from '..';
import { ThemeProvider } from '../../ThemeProvider';
import { Menu } from './Menu';

import type { Meta, StoryObj } from '@storybook/react';

const MenuStory = () => {
  return (
    <div style={{ minHeight: '300px' }}>
      <Menu>
        <Menu.Target>
          <Button variant="primary">Toggle Menu!</Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>Numbers</Menu.Label>
            {['one', 'two', 'three'].map((el) => {
              return <Menu.Item key={el}>{el}</Menu.Item>;
            })}
            <Menu.Divider />
          <Menu.Label>with icons</Menu.Label>
            <Menu.Item leftSection={<Icon name="edit"/>}>edit</Menu.Item>
            <Menu.Item leftSection={<Icon name="delete"/>} color="red">delete</Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </div>
  );
};

const meta: Meta<typeof MenuStory> = {
  component: MenuStory,
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
### Menu component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Menu>;

export const Basic: Story = {
  args: {
    children: 'Menu',
  },
};
