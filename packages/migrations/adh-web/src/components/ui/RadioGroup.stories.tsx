import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { RadioGroup, RadioGroupItem, type RadioGroupProps } from './RadioGroup';

const meta: Meta<RadioGroupProps> = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<RadioGroupProps>;

function DefaultRender() {
  const [value, setValue] = useState('option1');
  return (
    <RadioGroup name="demo" value={value} onChange={setValue}>
      <RadioGroupItem value="option1" id="r1" label="Option 1" />
      <RadioGroupItem value="option2" id="r2" label="Option 2" />
      <RadioGroupItem value="option3" id="r3" label="Option 3" />
    </RadioGroup>
  );
}

export const Default: Story = {
  render: () => <DefaultRender />,
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup name="disabled" value="option1" disabled>
      <RadioGroupItem value="option1" id="rd1" label="Selected but disabled" />
      <RadioGroupItem value="option2" id="rd2" label="Also disabled" />
    </RadioGroup>
  ),
};

function PaymentMethodsRender() {
  const [value, setValue] = useState('card');
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">Payment method</p>
      <RadioGroup name="payment" value={value} onChange={setValue}>
        <RadioGroupItem value="card" id="pay-card" label="Credit card" />
        <RadioGroupItem value="cash" id="pay-cash" label="Cash" />
        <RadioGroupItem value="giftpass" id="pay-gift" label="Gift Pass" />
        <RadioGroupItem value="resort" id="pay-resort" label="Resort Credit" />
      </RadioGroup>
    </div>
  );
}

export const PaymentMethods: Story = {
  render: () => <PaymentMethodsRender />,
};
