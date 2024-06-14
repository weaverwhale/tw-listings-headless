import { Button } from '../Button/Button';
import { Modal } from '../Modal/Modal';
import { useDisclosure } from '../../hooks/useDisclosure';
import { ThemeProvider } from '../../ThemeProvider';
import { LoadingOverlay } from './LoadingOverlay';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof LoadingOverlay> = {
  component: LoadingOverlay,
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
### LoadingOverlay component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof LoadingOverlay>;

export const Basic: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [opened, { toggle }] = useDisclosure(false);

    return (
      <>
        <Modal opened={opened} onClose={toggle}>
          <LoadingOverlay
            overlayProps={{ blur: '2px', radius: 'sm' }}
            zIndex={1000}
            visible={true}
          />
          Howdy! Modal is here
        </Modal>
        <Button onClick={toggle}>Click to toggle modal</Button>
      </>
    );
  },
};
