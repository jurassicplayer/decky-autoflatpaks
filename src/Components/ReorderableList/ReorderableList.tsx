import { Fragment, useEffect, useRef, useState } from 'react';
import { Focusable, GamepadEvent, GamepadButton, FocusableProps } from '@decky/ui';
import { ReorderableExtendedProps, ReorderableEntry, ReorderableItem } from './ReorderableItem';

/**
 * Properties for a ReorderableList component of type <T>.
 *
 * @param entries List of ReorderableEntry items to display, ordered by `position`.
 * @param onSave Callable function executed when saving list order.
 * @param disabled If reordering mode should be toggle-able. @default false
 * @param saveDescription Optional string for action description while in reordering mode. @default "Save Order"
 * @param reorderDescription Optional string for action description while NOT in reordering mode. @default "Reorder"
 * @param animate If the list should animate. @default true
 * @param focusableProps Optional properties for Focusable component encapsulating the ReorderableList.
 * @param activeCSS Optional css for selected item while in reordering mode.
 * @param inactiveCSS Optional css for non-selected items while in reordering mode.
 * @param defaultCSS Optional css for items while NOT in reordering mode.
 * @param fieldProps Optional properties for Field component encapsulating ReorderableEntries.
 */
export type ReorderableListV2Props<T> = ReorderableExtendedProps & {
  entries: ReorderableEntry<T>[];
  onSave: (entries: ReorderableEntry<T>[]) => void;
  disabled?: boolean;
  saveDescription?: string;
  reorderDescription?: string;
  animate?: boolean;
  focusableProps?: Omit<FocusableProps,"children">;
};

/**
 * Auxiliary function to update reorderable entries `position` property to match the current list order.
 * 
 * @param entries List of ReorderableEntry items to update.
 * @returns List of ReorderableEntry items with `position` matching current list order.
 */
export function inheritCurrentOrder<T>(entries: ReorderableEntry<T>[]){return entries.map((entry, idx)=> ({...entry, position:idx}))}
/**
 * A component for creating reorderable lists.
 *
 */
export function ReorderableListV2<T>(props: ReorderableListV2Props<T>) {
  const inheritCurrentPosition = (entries: ReorderableEntry<T>[]) => [...entries].sort((a: ReorderableEntry<T>, b: ReorderableEntry<T>) => a.position - b.position)
  const [entryList, setEntryList] = useState<ReorderableEntry<T>[]>([]);
  const entryListRef = useRef<ReorderableEntry<T>[]>([])
  const [reorderEnabled, setReorderEnabled] = useState<boolean>(false);
  const saveDescription = props.saveDescription ?? 'Save Order'
  const reorderDescription = props.reorderDescription ?? 'Reorder'

  useEffect(() => {
    let entries = inheritCurrentPosition(props.entries)
    if (!entryListRef.current.length) entryListRef.current = entries
    setEntryList(entries)
  }, [props.entries]);

  function toggleReorderEnabled(): void {
    setReorderEnabled((reorderEnabled) => {
      if (reorderEnabled) {
        props.onSave(entryList)
        entryListRef.current = entryList
      }
      return !reorderEnabled
    });
  }

  function onShiftPosition(entryData: ReorderableEntry<T>, offset: number){
    const listEntries = [...entryList]
    const currentIdx = listEntries.indexOf(entryData)
    const targetIdx = listEntries.findIndex((entry: ReorderableEntry<T>) => entry.position === entryData.position+offset);
    if (targetIdx == -1) return;
    [listEntries[currentIdx].position, listEntries[targetIdx].position] = [listEntries[targetIdx].position, listEntries[currentIdx].position]
    setEntryList(inheritCurrentPosition(listEntries))
  }

  function onBackout(event: GamepadEvent) {
    if (event.detail.button == GamepadButton.CANCEL && reorderEnabled) {
      setReorderEnabled(!reorderEnabled);
      setEntryList(inheritCurrentOrder(entryListRef.current));
    }
  }

  return (
    <Fragment>
      <div
        style={{
          width: 'inherit',
          height: 'inherit',
          flex: '1 1 1px',
          scrollPadding: '48px 0px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignContent: 'stretch',
        }}
      >
        <Focusable
          {...props.focusableProps}
          onSecondaryButton={props.disabled ? toggleReorderEnabled:undefined}
          onSecondaryActionDescription={props.disabled ? (reorderEnabled ? saveDescription : reorderDescription):undefined}
          onClick={props.disabled ? toggleReorderEnabled:undefined}
          onButtonDown={props.disabled ? onBackout:undefined}
        >
          {entryList.map((entry: ReorderableEntry<T>) => (
            <ReorderableItem
              onShiftPosition={onShiftPosition}
              animate={props.animate ?? true}
              activeCSS={entry.activeCSS ?? props.activeCSS}
              inactiveCSS={entry.inactiveCSS ?? props.inactiveCSS}
              defaultCSS={entry.defaultCSS ?? props.defaultCSS}
              fieldProps={entry.fieldProps ?? props.fieldProps}
              entryData={entry}
              reorderEnabled={reorderEnabled}
              disabled={props.disabled ?? false}
            />
          ))}
        </Focusable>
      </div>
    </Fragment>
  );
}