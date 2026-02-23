import type { Meta, StoryObj } from '@storybook/react';
import { Input, type InputProps } from './Input';
import { Label } from './Label';

const meta: Meta<InputProps> = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<InputProps>;

export const Default: Story = {
  args: { placeholder: 'Enter text...' },
};

export const WithValue: Story = {
  args: { defaultValue: 'Hello World' },
};

export const WithError: Story = {
  args: { error: 'This field is required', placeholder: 'Enter text...' },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'Cannot edit' },
};

export const Password: Story = {
  args: { type: 'password', placeholder: 'Enter password...' },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="email" required>Email</Label>
      <Input id="email" type="email" placeholder="user@example.com" />
    </div>
  ),
};

export const WithLabelAndError: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="amount" required>Amount</Label>
      <Input id="amount" type="number" error="Must be positive" defaultValue="-5" />
      <p className="text-xs text-danger">Must be positive</p>
    </div>
  ),
};
