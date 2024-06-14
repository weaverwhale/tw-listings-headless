import type { Meta, StoryObj } from '@storybook/react';
import { ThemeProvider } from '../../ThemeProvider';
import { Image } from '../Image/Image';
import { Text } from '../Text/Text';
import { Card } from '../Card/Card';
import { Tooltip } from '../Tooltip/Tooltip';

const meta: Meta<typeof Card> = {
  component: Card,
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
### Card component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Card>;

export const Basic: Story = {
  args: {
    children: 'Card',
  },
};

export const Sectioned: Story = {
  render: () => {
    return (
      <Tooltip label="whoa!!">
        <Card
          shadow="sm"
          padding="xl"
          as="a"
          href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          target="_blank"
        >
          <Card.Section>
            <Image
              src="https://images.unsplash.com/photo-1579227114347-15d08fc37cae?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2550&q=80"
              h={160}
              alt="No way!"
            />
          </Card.Section>

          <Text fw={500} size="lg" mt="md">
            You&apos;ve won a million dollars in cash!
          </Text>

          <Text mt="xs" c="one.5" size="sm">
            Please click anywhere on this card to claim your reward, this is not a fraud, trust us
          </Text>
        </Card>
      </Tooltip>
    );
  },
};
