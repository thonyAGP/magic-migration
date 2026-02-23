import type { Meta, StoryObj } from '@storybook/react';
import { Button, type ButtonProps } from './Button';
import { Save, Trash2, Plus } from 'lucide-react';

const meta: Meta<ButtonProps> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
};

export default meta;
type Story = StoryObj<ButtonProps>;

export const Default: Story = {
  args: { children: 'Button' },
};

export const Destructive: Story = {
  args: { children: 'Delete', variant: 'destructive' },
};

export const Outline: Story = {
  args: { children: 'Outline', variant: 'outline' },
};

export const Secondary: Story = {
  args: { children: 'Secondary', variant: 'secondary' },
};

export const Ghost: Story = {
  args: { children: 'Ghost', variant: 'ghost' },
};

export const Link: Story = {
  args: { children: 'Link', variant: 'link' },
};

export const Small: Story = {
  args: { children: 'Small', size: 'sm' },
};

export const Large: Story = {
  args: { children: 'Large', size: 'lg' },
};

export const Icon: Story = {
  args: { children: <Plus className="h-4 w-4" />, size: 'icon', 'aria-label': 'Add' },
};

export const WithIcon: Story = {
  args: { children: <><Save className="h-4 w-4" /> Save</> },
};

export const Disabled: Story = {
  args: { children: 'Disabled', disabled: true },
};

export const DestructiveWithIcon: Story = {
  args: {
    children: <><Trash2 className="h-4 w-4" /> Delete</>,
    variant: 'destructive',
  },
};
