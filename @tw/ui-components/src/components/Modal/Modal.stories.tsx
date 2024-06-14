import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ThemeProvider } from '../../ThemeProvider';
import { Modal } from './Modal';
import { Button } from '../Button/Button';
import { ThemeToggle } from '../../utils/ThemeToggle';

const meta: Meta<typeof Modal> = {
  component: Modal,
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
### Modal component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Modal>;

export const Basic: Story = {
  args: {
    children: 'Modal',
  },
};

export const Compound: Story = {
  render: () => {
    const [opened, setOpened] = useState(false);

    return (
      <>
        <Modal.Root opened={opened} onClose={() => setOpened(false)}>
          <Modal.Overlay />
          <Modal.Content>
            <Modal.Header>
              <Modal.Title>Modal title</Modal.Title>
              <Modal.CloseButton />
            </Modal.Header>
            <Modal.Body>Modal content</Modal.Body>
          </Modal.Content>
        </Modal.Root>

        <Button onClick={() => setOpened(true)}>Open Modal</Button>
      </>
    );
  },
};

export const WithFooter: Story = {
  render: () => {
    const [opened, setOpened] = useState(false);

    return (
      <>
        <Modal onClose={() => setOpened(false)} opened={opened}>
          <Modal.Header>
            <Modal.Title>Modal title</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div style={{ height: '700px' }}>Modal content</div>
          </Modal.Body>
          <Modal.Footer>howdy</Modal.Footer>
        </Modal>

        <ThemeToggle />
        <Button onClick={() => setOpened(true)}>Open Modal</Button>
      </>
    );
  },
};
