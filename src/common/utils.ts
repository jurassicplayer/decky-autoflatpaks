/*
##TODO: Add method to get value from localStorage
##TODO: Add method to set value to localStorage
*/
export function splitMinutes(totalMinutes:number){
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60
  return {days, hours, minutes}
}

export function mergeMinutes(days:number, hours:number, minutes:number) {
  return (days * 24 * 60) + (hours * 60) + minutes
}