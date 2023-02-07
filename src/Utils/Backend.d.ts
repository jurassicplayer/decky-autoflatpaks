export interface queueData {
  action: string
  packageRef: string
  extraParameters?: {
    removeUnused?: boolean
    installSource?: string
    installDestination?: string
    appdataDestination?: string[]
  }
}

export interface queueRetCode {
  queueData: queueData
  retcode: boolean
}

export interface cliOutput {
  output?: any
  returncode: number
  stdout: string
  stderr: string
}

export interface BatteryState {
  bHasBattery: boolean,
  bShutdownRequested: boolean,
  eACState: number,
  flLevel: number,
  nSecondsRemaining: number,
}

