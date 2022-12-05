export interface FlatpakMetadata {
  name:             string
  application:      string
  description:      string
  version:          string
  branch:           string
  arch:             string
  origin:           string
  ref:              string
  runtime:          string
  options:          string
  installed_size:   string
  // remote only
  commit?:           string
  download_size?:    string
  // local only
  active?:          string
  installation?:    string
  latest?:          string
  // update only
  partial?:         boolean
  // plugin computed metadata
  packagetype:      string
  updateable:       boolean
  masked:           boolean
  installed:        boolean
  parent?:          string
  parentMasked?:    boolean
}

export interface FlatpakUpdate {
  application:    string
  branch:         string
  op:             string
  remote:         string
  download_size:  string
  partial:        boolean
}

export interface LocalFlatpakMetadata {
  name: string
  application: string
  description: string
  version: string
  branch: string
  arch: string
  origin: string
  ref: string
  runtime: string
  options: string
  installed_size: string
  // Local flatpak specific
  active: string
  installation: string
  latest: string
  // Plugin specific
  packagetype: string
  parent?: string
}

export interface RemoteFlatpakMetadata {
  name: string
  application: string
  description: string
  version: string
  branch: string
  arch: string
  origin: string
  ref: string
  runtime: string
  options: string
  installed_size: string
  // Remote flatpak specific
  commit: string
  download_size: string
  // Plugin specific
  packagetype: string
  parent?: string
}