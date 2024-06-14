import { ThemeProvider } from '../../ThemeProvider';
import { ConfirmModal } from './ConfirmModal';
import { confirm } from './confirm';

import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../Button/Button';
import { $store } from '@tw/snipestate';
import { Flex, TextInput } from '@mantine/core';

const meta: Meta<typeof ConfirmModal> = {
  component: ConfirmModal,
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
### ConfirmModal component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof ConfirmModal>;

export const Basic: Story = {
  args: {
    // children: 'ConfirmModal',
  },
};

export const Compound: Story = {
  render: () => {
    const complicatedCallback = async () => {
      if (await confirm({ title: 'testing', message: 'some message' })) {
        console.log('woo hoo!!!');
      } else {
        console.log('oy vey');
      }
    };

    const complicatedCallback2 = async () => {
      if (
        await confirm({
          title: 'testing',
          message: 'some message',
          modalProps: { size: 'lg', zIndex: 200 },
          confirmText: 'Hi!',
          cancelText: 'Bye!',
          reverseOrder: true,
        })
      ) {
        console.log('woo hoo!!!');
      } else {
        console.log('oy vey');
      }
    };

    const complicatedCallback3 = async () => {
      let text = ''

      if (
        await confirm({
          title: 'testing',
          message: <TextInput onChange={e => text = e.target.value} />,
          modalProps: { size: 'lg', zIndex: 200 },
          confirmText: 'Hi!',
          cancelText: 'Bye!',
          reverseOrder: true,
        })
      ) {
        console.log('woo hoo!!!', text);
      } else {
        console.log('oy vey');
      }
    };

    const complicatedCallback4 = async () => {
      const $inputText = $store('')

      const Component = () => {
        const [text, setText] = $inputText.useStore()

        return <TextInput value={text} onChange={e => setText(e.target.value)} />
      }

      if (
        await confirm({
          title: 'testing',
          message: Component,
          modalProps: { size: 'lg', zIndex: 200 },
          confirmText: 'Hi!',
          cancelText: 'Bye!',
          reverseOrder: true,
        })
      ) {
        console.log('woo hoo!!!', $inputText.get());
      } else {
        console.log('oy vey');
      }
    };

    return (
      <Flex gap="md" direction="column">
        <ConfirmModal />

        <Button onClick={complicatedCallback}>Open Modal</Button>

        <Button onClick={complicatedCallback2}>Open Fancy Modal</Button>

        <Button onClick={complicatedCallback3}>UNCONTROLLED - Open Fancy Modal With Component as Message</Button>

        <Button onClick={complicatedCallback4}>CONTROLLED - Open Fancy Modal With Component as Message</Button>
      </Flex>
    );
  },
};
