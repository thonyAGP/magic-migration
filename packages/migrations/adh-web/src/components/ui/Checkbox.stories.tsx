import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox, type CheckboxProps } from './Checkbox';

const meta: Meta<CheckboxProps> = {
  title: 'UI/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<CheckboxProps>;

export const Default: Story = {
  args: { id: 'terms', label: 'Accept terms' },
};

export const Checked: Story = {
  args: { id: 'checked', label: 'Checked item', defaultChecked: true },
};

export const Indeterminate: Story = {
  args: { id: 'indeterminate', label: 'Partial selection', indeterminate: true },
};

export const Disabled: Story = {
  args: { id: 'disabled', label: 'Disabled checkbox', disabled: true },
};

export const DisabledChecked: Story = {
  args: { id: 'disabled-checked', label: 'Disabled checked', disabled: true, defaultChecked: true },
};

export const WithoutLabel: Story = {
  args: { id: 'no-label', 'aria-label': 'Toggle item' },
};
