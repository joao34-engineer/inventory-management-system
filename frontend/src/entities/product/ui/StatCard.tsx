import { Card } from '@shared/ui'
import './StatCard.css'

interface StatCardProps {
  label: string
  value: string | number
  className?: string
}

export const StatCard = ({ label, value, className = '' }: StatCardProps) => {
  return (
    <Card className={`stat-card ${className}`}>
      <span className='stat-value'>{value}</span>
      <span className='stat-label'>{label}</span>
    </Card>
  )
}
