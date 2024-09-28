import { call } from "@decky/api"
export function pyCall(functionName:string, className?:string, args?:any){
  let result
  if (className != undefined)
    result = call<[className:string, functionName:string, args:any],any>("pyCall", className, functionName, args)
  else {
    if (args != undefined)
      result = call<[args:any], any>(functionName, args)
    else
    result = call<any,any>(functionName)
  }
  return result
}


export class Installation {
  static readonly className:string = this.prototype.constructor.name
  static getAllInstallations(){
    return pyCall('getAllInstallations', this.className)
  }
}
