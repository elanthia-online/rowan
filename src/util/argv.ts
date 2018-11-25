type Argument =
  | string
  | Array<string> 
  | boolean
  | number

type CLIArgs =
  | Record<string, Argument>
export default class ARGV {
  static _ARGS = ARGV.nonce(process.argv)

  static cast (val : any) {
    if (isNaN(val)) return val
    return parseInt(val)
  }

  static nonce (args : Array<string>) : CLIArgs {
    return args.slice(2).reduce(function (parsed : CLIArgs, arg : string) {
      if (~arg.indexOf("=")) {
        const [flag, val] = arg.split("=")
        const maybe_list : string[] = val.split(",")
        const flat_arg = maybe_list.length == 1 ? maybe_list.shift() : maybe_list
        if (flat_arg) parsed[flag.replace("--", "")] = ARGV.cast(flat_arg)
        return parsed
      }
  
      parsed[arg.replace("--", "")] = true
      return parsed
    }, {} as CLIArgs)
  }

  static parse () {
    return new Map(Object.entries(ARGV._ARGS))
  }
}