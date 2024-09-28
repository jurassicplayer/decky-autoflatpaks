import { JSXElementConstructor } from 'react';
import { ReorderableListV2, ReorderableListV2Props } from './ReorderableList'
import { ReorderableExtendedProps, ReorderableEntry } from './ReorderableItem'

/**
 * Reorderable List Shim
 * Shim to translate old implementation calls into the new one
 * See an example implementation {@linkplain https://github.com/Tormak9970/Component-Testing-Plugin/blob/main/src/testing-window/ReorderableListTest.tsx here}.
 */
export function ReorderableList<T>(props: ReorderableListProps<T>) {
  return (
    <ReorderableListV2<T>
      {...props}
      entries={props.entries.map(entry => ({...entry, component: props.interactables}))}
    />
  )
}
export type ReorderableListProps<T> = ReorderableExtendedProps & ReorderableListV2Props<T> & {
  interactables?: JSXElementConstructor<{ entry: ReorderableEntry<T> }>;
}