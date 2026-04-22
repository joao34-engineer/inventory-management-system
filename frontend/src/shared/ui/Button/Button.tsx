import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import './Button.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  leftIcon?: ReactNode
}

export const Button = ({ className = '', children, leftIcon, ...props }: ButtonProps) => {
  return (
    <button className={`ui-button ${className}`} {...props}>
      {leftIcon}
      {children}
    </button>
  )
}
