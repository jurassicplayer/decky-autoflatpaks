import { createContext, FC, ReactNode, useContext, useState } from "react"

export type PackageDetailsType = {
  name: string
  packageID: string
}

type PackagePageContextType = {
  selectedPackage: PackageDetailsType | null
  setSelectedPackage: (pkg: PackageDetailsType) => void
}

const PackagePageContext = createContext<PackagePageContextType|undefined>(undefined)

export const PackagePageContextProvider:FC<{children: ReactNode}> = ({children}) => {
  const [selectedPackage, setSelectedPackage] = useState<PackageDetailsType | null>(null)
  return (
    <PackagePageContext.Provider value={{ selectedPackage, setSelectedPackage }}>
      {children}
    </PackagePageContext.Provider>
  )
}

export function usePackagePageContext() {
  const context = useContext(PackagePageContext)
  if (!context) {throw new Error("usePackagePageContext must be used within PackagePageContextProvider")}
  return context
}