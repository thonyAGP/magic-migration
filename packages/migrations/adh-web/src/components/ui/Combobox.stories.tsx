import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Combobox, type ComboboxProps } from './Combobox';
import { Label } from './Label';

const currencies = [
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'CHF', label: 'CHF - Swiss Franc' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'CNY', label: 'CNY - Chinese Yuan' },
  { value: 'BRL', label: 'BRL - Brazilian Real' },
  { value: 'INR', label: 'INR - Indian Rupee' },
];

const meta: Meta<ComboboxProps> = {
  title: 'UI/Combobox',
  component: Combobox,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ComboboxProps>;

function DefaultRender() {
  const [value, setValue] = useState('');
  return (
    <div className="w-64">
      <Combobox
        options={currencies}
        value={value}
        onChange={setValue}
        placeholder="Select currency..."
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <DefaultRender />,
};

function WithLabelRender() {
  const [value, setValue] = useState('EUR');
  return (
    <div className="flex w-64 flex-col gap-1.5">
      <Label required>Currency</Label>
      <Combobox
        options={currencies}
        value={value}
        onChange={setValue}
        placeholder="Select currency..."
      />
    </div>
  );
}

export const WithLabel: Story = {
  render: () => <WithLabelRender />,
};

export const WithError: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-1.5">
      <Label required>Currency</Label>
      <Combobox
        options={currencies}
        value=""
        error="Required"
        placeholder="Select currency..."
      />
      <p className="text-xs text-danger">Required</p>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    options: currencies,
    value: 'EUR',
    disabled: true,
    placeholder: 'Select currency...',
  },
};

function FewOptionsRender() {
  const [value, setValue] = useState('');
  return (
    <div className="w-64">
      <Combobox
        options={[
          { value: 'open', label: 'Open' },
          { value: 'closed', label: 'Closed' },
        ]}
        value={value}
        onChange={setValue}
        placeholder="Select status..."
        emptyMessage="No statuses found."
      />
    </div>
  );
}

export const FewOptions: Story = {
  render: () => <FewOptionsRender />,
};

function WithDisabledOptionsRender() {
  const [value, setValue] = useState('');
  return (
    <div className="w-64">
      <Combobox
        options={[
          { value: 'EUR', label: 'EUR - Euro' },
          { value: 'USD', label: 'USD - US Dollar' },
          { value: 'GBP', label: 'GBP - British Pound', disabled: true },
        ]}
        value={value}
        onChange={setValue}
        placeholder="Select currency..."
      />
    </div>
  );
}

export const WithDisabledOptions: Story = {
  render: () => <WithDisabledOptionsRender />,
};
