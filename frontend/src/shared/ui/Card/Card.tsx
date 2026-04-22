import { type ReactNode } from 'react'
import './Card.css'

interface CardProps {
  children: ReactNode
  className?: string
}

export const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`ui-card ${className}`}>
      {children}
    </div>
  )
}
