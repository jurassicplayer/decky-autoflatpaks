import { ReactNode } from "react";

// Could use extends ItemProps and omit unimplemented features
interface SpinnerProps {
  label?: ReactNode
  value: number
  disabled?: boolean
  min?: number
  max?: number
  onChange?: (value:number) => void
}

export interface HorizontalSpinnerProps extends SpinnerProps {
  description?: ReactNode
  bottomSeparator?: 'standard' | 'thick' | 'none'
  indentLevel?: number
}
export interface VerticalSpinnerProps extends SpinnerProps {}
export interface DayHourMinuteSpinnerProps {
  label?: ReactNode
  value: number
  description?: ReactNode
  disabled?:boolean
  bottomSeparator?: 'standard' | 'thick' | 'none'
  indentLevel?: number
  onChange?:(value:number) => void
}