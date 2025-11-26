import React from 'react';
import styles from './Input.module.css';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={clsx(styles.input, className)}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
