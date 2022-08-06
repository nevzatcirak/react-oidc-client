import {useRef} from 'react';

export function getBoolValue(val: any){
    switch (typeof val) {
      case "string":
        return val === "true";
      case "boolean":
        return val;
      default:
        return false;
    }
  }

  
export const useComponentWillMount = (func: Function) => {
  const willMount = useRef(true);

  if (willMount.current) {
    func();
  }

  willMount.current = false;
};