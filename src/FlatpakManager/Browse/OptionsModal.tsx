import { Focusable, Dropdown, ModalRoot, staticClasses, TextField } from 'decky-frontend-lib'
import { useState } from 'react'

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
  const updateSelectedOptions = (options: {filterSearch?: string, filterType?: string, filterStatus?: string, filterMask?: string, sortOrder?: string}) => {
    let newOptions = {
      ...currentOptions,
    }
    if (typeof options.filterSearch == 'string') newOptions = {...newOptions, filterSearch:  options.filterSearch}
    if (options.filterType)   newOptions = {...newOptions, filterType:    options.filterType}
    if (options.filterStatus) newOptions = {...newOptions, filterStatus:  options.filterStatus}
    if (options.filterMask)   newOptions = {...newOptions, filterMask:    options.filterMask}
    if (options.sortOrder)    newOptions = {...newOptions, sortOrder:     options.sortOrder}
    console.log('Setting new options: ', newOptions)
    setCurrentOptions(newOptions)
    props.setSelectedOptions(newOptions)
  }

  return (
    <ModalRoot bAllowFullSize={false}
      closeModal={()=>{
        updateSelectedOptions({filterSearch: search})
        if (props.closeModal) { props.closeModal() }
      }}>
      <Focusable>
        <div className={staticClasses.PanelSectionTitle}>Filter: Search</div>
        <TextField
          bShowClearAction={true}
          bAlwaysShowClearAction={true}
          contentEditable={true}
          onChange={(e) => {setSearch(e.currentTarget.value)}}
          defaultValue={props.selectedOptions.filterSearch}/>
        <div style={{display:"flex", flexDirection: "row", justifyContent: "space-between"}}>
          {/* Package Type */}
          <div className={staticClasses.PanelSectionTitle}>Filter: Type</div>
          <Focusable style={{minWidth: "50%"}}>
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
        <div style={{display:"flex", flexDirection: "row", justifyContent: "space-between"}}>
          {/* Package Status */}
          <div className={staticClasses.PanelSectionTitle}>Filter: Status</div>
          <Focusable style={{minWidth: "50%"}}>
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
        <div style={{display:"flex", flexDirection: "row", justifyContent: "space-between"}}>
          <div className={staticClasses.PanelSectionTitle}>Filter: Mask</div>
          {/* Package Mask */}
          <Focusable style={{minWidth: "50%"}}>
          <Dropdown selectedOption={props.selectedOptions.filterMask}
            onChange={(e) => {updateSelectedOptions({filterMask: e.data})}}
            rgOptions={[
            { label: 'All', data: 'all' },
            { label: 'Masked', data: 'masked' },
            { label: 'Unmasked', data: 'unmasked' },
          ]} /></Focusable>
        </div>
        <div style={{display:"flex", flexDirection: "row", justifyContent: "space-between"}}>
          <div className={staticClasses.PanelSectionTitle}>Sort</div>
          <Focusable style={{minWidth: "50%"}}>
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
    </ModalRoot>
  )
}