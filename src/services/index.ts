import { SourceServiceCtor } from "../plugin/source.service"
import ExampleService from "./example.service"
import FlatpakService from "./flatpak.service"

const Services:SourceServiceCtor<any, any>[] = [
  ExampleService,
  FlatpakService
]

export const PackageServices:Record<string, SourceServiceCtor<any, any>> = Services.reduce(
  (acc, ServiceConstructor) => {
    acc[ServiceConstructor.sourceKey] = ServiceConstructor
    return acc
  },
  {} as Record<string, SourceServiceCtor<any, any>>
)