export interface FlatpakMetadata {
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
  // Local only metadata
  active?: string,
  installation?: string,
  latest?: string,
  size?: string,
  // Remote only metadata
  commit?: string,
  installed_size?: string,
  download_size?: string,
  // Plugin metadata
  masked?: boolean = false,
  installed?: boolean = false
}