import type { ButtonHTMLAttributes, ReactNode } from 'react';

import styles from './style/button.module.scss';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, variant = 'secondary', className, ...rest }: ButtonProps) {
  const classNames = [styles['c-button'], styles[`m-${variant}`], className]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classNames} {...rest}>
      {children}
    </button>
  );
}
