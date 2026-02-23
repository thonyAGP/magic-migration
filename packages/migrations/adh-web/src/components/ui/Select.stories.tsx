import type { Meta, StoryObj } from '@storybook/react';
import { Select, SelectOption, type SelectProps } from './Select';
import { Label } from './Label';

const meta: Meta<SelectProps> = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<SelectProps>;

export const Default: Story = {
  render: () => (
    <Select placeholder="Select currency..." defaultValue="">
      <SelectOption value="EUR">EUR - Euro</SelectOption>
      <SelectOption value="USD">USD - US Dollar</SelectOption>
      <SelectOption value="GBP">GBP - British Pound</SelectOption>
    </Select>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="currency" required>Currency</Label>
      <Select id="currency" placeholder="Select currency..." defaultValue="">
        <SelectOption value="EUR">EUR - Euro</SelectOption>
        <SelectOption value="USD">USD - US Dollar</SelectOption>
        <SelectOption value="GBP">GBP - British Pound</SelectOption>
      </Select>
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="err-select">Status</Label>
      <Select id="err-select" error="Required" defaultValue="">
        <SelectOption value="">Choose...</SelectOption>
        <SelectOption value="open">Open</SelectOption>
        <SelectOption value="closed">Closed</SelectOption>
      </Select>
      <p className="text-xs text-danger">Required</p>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Select disabled defaultValue="EUR">
      <SelectOption value="EUR">EUR - Euro</SelectOption>
    </Select>
  ),
};
