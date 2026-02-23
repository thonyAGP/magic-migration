import type { Meta, StoryObj } from '@storybook/react';
import { Label, type LabelProps } from './Label';

const meta: Meta<LabelProps> = {
  title: 'UI/Label',
  component: Label,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<LabelProps>;

export const Default: Story = {
  args: { children: 'Label text' },
};

export const Required: Story = {
  args: { children: 'Email', required: true },
};
