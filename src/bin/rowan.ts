#!/usr/bin/env node
import ARGV  from "../util/argv"
import fs    from "fs"
import path  from "path"
import {Koschei, App, Hilite} from "../"

const port = 
  ARGV.parse().get("port") as number

const char =
  (ARGV.parse().get("char") || "").toString()

const rowan_log_file =
  fs.createWriteStream(path.join(process.cwd(), "log", `rowan.${port}.log`))

const koschei_log_file = process.env.NODE_ENV == "debug" 
  ? fs.createWriteStream(path.join(process.cwd(), "log", "koschei.log"))
  : void(0)

const parser = 
  Koschei.connect(
    { port
    , log : koschei_log_file
    })

const app = 
  App.of(
    { parser
    , title : char || "GemstoneIV"
    , log   : rowan_log_file
    })

export default (async function main () {
  await Hilite.load_color_scheme()
  app.render()
}())
