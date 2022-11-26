export interface FlatpakUpdate {
  application:    string
  branch:         string
  op:             string
  remote:         string
  download_size:  string
  partial:        boolean
}

export interface LocalFlatpakMetadata {
  name: string,
  application: string,
  description: string,
  version: string,
  branch: string,
  arch: string,
  origin: string,
  ref: string,
  runtime: string,
  options: string,
  active?: string,
  installation?: string,
  latest?: string,
  size?: string,
  packagetype: string
}

export interface RemoteFlatpakMetadata {
  name: string,
  application: string,
  description: string,
  version: string,
  branch: string,
  arch: string,
  origin: string,
  ref: string,
  runtime: string,
  options: string,
  commit?: string,
  installed_size?: string,
  download_size?: string,
}