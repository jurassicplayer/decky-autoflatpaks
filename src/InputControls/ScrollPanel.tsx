import { findModuleChild } from 'decky-frontend-lib';
import { ReactNode, HTMLAttributes, RefAttributes, VFC } from 'react';

//Unclear how many of these have an effect (also probably not exhaustive)
interface ScrollPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  scrollDirection?: 'x' | 'y' | 'both';
  focusable?: boolean;
  autoFocus?: boolean;
  scrollStepPercent?: number;
  scrollBehavior?: string;
  noFocusRing?: boolean;
  onOKButton?: (e: CustomEvent) => void;
  onCancelButton?: (e: CustomEvent) => void;
}

export const ScrollPanel: any = findModuleChild((m) => {
  if (typeof m !== 'object') return undefined;
  for (let prop in m) {
    if (m[prop]?.render
      ?.toString()
      ?.includes('["onOKButton","onCancelButton","navRef","focusable"]'))
      return m[prop];
  }
}) as VFC<ScrollPanelProps & RefAttributes<HTMLDivElement>>;