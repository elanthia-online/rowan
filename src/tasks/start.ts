import {Koschei, App, Hilite} from "../"
import Debug from "../util/debug"

function die (flag : string) {
  throw new Error(`missing required --${flag}`)
}

function fetch (argv : Map<string, any>, flag : string) {
  return argv.get(flag) || process.env[flag.toLowerCase()] 
}

export default async function start (argv : Map<string, any>) {
  const port = 
    parseInt(fetch(argv, "port") || die("port")) 
  const char = 
    fetch(argv, "char") as string
  const parser = 
    Koschei.connect(
      { port
      })
  let title = 
    char ? char : "GemstoneIV"
  if (!!fetch(argv, "debug")) title = `${title} [debug]`
  const app = 
    App.of(
      { parser
      , title
      , max_buffer_size : argv.get("max_buffer_size")
      })

  if (!!fetch(argv, "debug")) {
    await Debug.attach(
      { logs     : fetch(argv, "logs")
      , emitters : Object.values(app.dom).concat([app] as any[])
      })
  } 

  await Hilite.load_color_scheme(char)
  await Hilite.load_user_patterns()
  app.redraw()
}