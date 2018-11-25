import fs           from "fs"
import path         from "path"
import * as Koschei from "@elanthia/koschei"
import {App}        from "./ui"
import Hilite       from "./hilite/hilite"

const port = 
  parseInt(process.argv[process.argv.length-1])

const log =
  fs.createWriteStream(`${process.cwd()}/log/rowan.${port}.log`, {flags: "w"})

const parser = Koschei.connect(
  { port
  , log  : process.env.NODE_ENV == "debug" 
            ? fs.createWriteStream(path.join(process.cwd(), "log", "koschei.log"))
            : void(0)
  })

const app = App.of(
  { parser
  , title : process.env.TITLE || "Gemstone IV"
  , log   : log
  })

export {app, parser}

(async function main () {
  await Hilite.load_color_scheme()
  app.render()
}())

