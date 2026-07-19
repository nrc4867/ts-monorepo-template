import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { classNames } from '../../lib/class-names.js';
import styles from './styles/button.module.scss';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, variant = 'secondary', className, ...rest }: ButtonProps) {
  return (
    <button className={classNames(styles, 'c-button', `m-${variant}`, className)} {...rest}>
      {children}
    </button>
  );
}
