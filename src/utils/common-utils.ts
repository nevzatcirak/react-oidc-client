
export function getBoolValue(val: any){
    switch (typeof val) {
      case "string":
        return val === "true";
      case "boolean":
        return val;
      default:
        return false;
    }
  };