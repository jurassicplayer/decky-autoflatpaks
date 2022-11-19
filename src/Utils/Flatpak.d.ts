export interface FlatpakUpdate {
  application:    string
  branch:         string
  op:             string
  remote:         string
  download_size:  string
  partial:        boolean
}