import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import './Input.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export const Input = ({ label, error, leftIcon, rightIcon, className = '', ...props }:
  InputProps) => {

  const generatedId = useId()
  const id = props.id || generatedId
  return (
    <div className={`ui-input-wrapper ${className}`}>
      {label && <label htmlFor={id} className="ui-label">{label}</label>}

      <div className={`ui-input-container ${error ? 'error' : ''}`}>
        {leftIcon && <span className="ui-input-icon left">{leftIcon}</span>}

        <input
          {...props}
          id={id}
          className="ui-input-field"
        />

        {rightIcon && <span className="ui-input-icon right">{rightIcon}</span>}
      </div>

      {error && <span className="ui-error">{error}</span>}
    </div>
  )
}