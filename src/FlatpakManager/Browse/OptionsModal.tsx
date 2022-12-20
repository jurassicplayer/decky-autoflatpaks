import { Focusable, Dropdown, staticClasses, TextField } from 'decky-frontend-lib'
import { useState } from 'react'
import { FallbackModal } from '../../InputControls/FallbakModal'
import { DropdownContainer, OptionRowContainer, OptionRowLabel } from "./OptionsModal.css"

export interface FPMOptions {
  sortOrder: string
  filterSearch: string
  filterType: string
  filterStatus: string
  filterMask: string
}

export const OptionsModal = (props: {selectedOptions: FPMOptions, setSelectedOptions: CallableFunction, closeModal?: CallableFunction}) => {
  const [search, setSearch] = useState<string>(props.selectedOptions.filterSearch)
  const [currentOptions, setCurrentOptions] = useState<FPMOptions>(props.selectedOptions)
  const updateSelectedOptions = (options: {filterType?: string, filterStatus?: string, filterMask?: string, sortOrder?: string}) => {
    let newOptions = {
      ...currentOptions,
    }
    if (search != currentOptions.filterSearch) newOptions = {...newOptions, filterSearch: search}
    if (options.filterType)   newOptions = {...newOptions, filterType:    options.filterType}
    if (options.filterStatus) newOptions = {...newOptions, filterStatus:  options.filterStatus}
    if (options.filterMask)   newOptions = {...newOptions, filterMask:    options.filterMask}
    if (options.sortOrder)    newOptions = {...newOptions, sortOrder:     options.sortOrder}
    if (newOptions.filterSearch != currentOptions.filterSearch
      || newOptions.filterType != currentOptions.filterType
      || newOptions.filterStatus != currentOptions.filterStatus
      || newOptions.filterMask != currentOptions.filterMask
      || newOptions.sortOrder != currentOptions.sortOrder
      ) {
        console.log('Setting new options: ', newOptions)
        setCurrentOptions(newOptions)
        props.setSelectedOptions(newOptions)
      }
  }

  return (
    <FallbackModal
      bAllowFullSize={false}
      closeModal={()=>{
        updateSelectedOptions({})
        if (props.closeModal) { props.closeModal() }
      }}>
      <Focusable>
        <div style={OptionRowContainer}>
          <div className={staticClasses.PanelSectionTitle} style={OptionRowLabel}>Filter: Search</div>
          <Focusable style={{minWidth: "75%"}}>
            <TextField
              style={{borderRadius: "2px"}}
              bShowClearAction={true}
              bAlwaysShowClearAction={true}
              contentEditable={true}
              onChange={(e) => {setSearch(e.currentTarget.value)}}
              defaultValue={props.selectedOptions.filterSearch}/>
          </Focusable>
        </div>
        <div style={OptionRowContainer}>
          {/* Package Type */}
          <div className={staticClasses.PanelSectionTitle} style={OptionRowLabel}>Filter: Type</div>
          <Focusable style={DropdownContainer}>
            <Dropdown
              selectedOption={props.selectedOptions.filterType}
              onChange={(e) => {updateSelectedOptions({filterType: e.data})}}
              rgOptions={[
              { label: 'All', data: 'all' },
              { label: 'App', data: 'app' },
              { label: 'Runtime', data: 'runtime' }
            ]} />
          </Focusable>
        </div>
        <div style={OptionRowContainer}>
          {/* Package Status */}
          <div className={staticClasses.PanelSectionTitle} style={OptionRowLabel}>Filter: Status</div>
          <Focusable style={DropdownContainer}>
          <Dropdown selectedOption={props.selectedOptions.filterStatus}
            onChange={(e) => {updateSelectedOptions({filterStatus: e.data})}}
            rgOptions={[
            { label: 'All',           data: 'all' },
            { label: 'Installed',     data: 'installed' },
            { label: 'Not Installed', data: 'notinstalled' },
            { label: 'Queued',        data: 'queued' },
            { label: 'Updateable',    data: 'updateable' },
          ]} /></Focusable>
        </div>
        <div style={OptionRowContainer}>
          <div className={staticClasses.PanelSectionTitle} style={OptionRowLabel}>Filter: Mask</div>
          {/* Package Mask */}
          <Focusable style={DropdownContainer}>
          <Dropdown selectedOption={props.selectedOptions.filterMask}
            onChange={(e) => {updateSelectedOptions({filterMask: e.data})}}
            rgOptions={[
            { label: 'All', data: 'all' },
            { label: 'Masked', data: 'masked' },
            { label: 'Unmasked', data: 'unmasked' },
          ]} /></Focusable>
        </div>
        <div style={OptionRowContainer}>
          <div className={staticClasses.PanelSectionTitle} style={OptionRowLabel}>Sort Order</div>
          <Focusable style={DropdownContainer}>
          <Dropdown selectedOption={props.selectedOptions.sortOrder}
            onChange={(e) => {updateSelectedOptions({sortOrder: e.data})}}
            rgOptions={[
            { label: 'Alphabetical (A to Z))', data: 'a2z' },
            { label: 'Alphabetical (Z to A)', data: 'z2a' },
            { label: 'Size (Largest)', data: 'slarge' },
            { label: 'Size (Smallest)', data: 'ssmall' },
          ]} /></Focusable>
        </div>
      </Focusable>
    </FallbackModal>
  )
}