import { type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = ({ label, className, ...props }: InputProps) => (
  <div>
    {label && <label>{label}</label>}
    <input className={className} {...props} />
  </div>
);
