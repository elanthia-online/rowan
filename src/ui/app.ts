import fs           from "fs"
import util         from "util"
import * as Koschei from "@elanthia/koschei"
import blessed      from "blessed"
import Feed         from "./components/feed"
import Input        from "./components/input"
import Pane         from "./components/pane"
import { EventEmitter } from "events";

declare interface AppOpts {
  title : string;
  max_buffer_size? : number;
  parser : Koschei.Bridge;
  log? : fs.WriteStream;
}

declare interface PanesMap {
  left  : Pane;
  right : Pane;
}

const CURSOR_OPTS : any =
  { artificial : true
  , blink      : true
  , shape      : 'underline'
  , color      : '#f1f1f1'
  }

export default class App extends EventEmitter {
  static of (opts : AppOpts) {
    return new App(opts)
  }

  readonly screen  : blessed.Widgets.Screen;
  readonly parser  : Koschei.Bridge;
  readonly panes   : PanesMap;
  readonly log?    : fs.WriteStream;
  readonly feed    : Feed;
  readonly input   : Input;
  readonly components : Map<string, any>;
  prompt : string;
  server_offset : number;

  constructor ({title, max_buffer_size, log, parser} : AppOpts) {
    super()
    this.parser     = parser
    this.log        = log
    this.components = new Map()
    this.prompt     = ">"
    this.server_offset = 0

    process.on("log" as any, (data : any) => this.onlog(data))

    const screen = this.screen = blessed.screen(
      { smartCSR : true
      , cursor   : CURSOR_OPTS
      }) as blessed.Widgets.Screen;

    if (title) screen.title = title

    this.panes = 
      { left  : Pane.of({screen, width: 10})
      , right : Pane.of({screen, width: 90, left: 10})
      }

    // the main input box like all other FEs
    this.input = Input.of({screen
      , parent : this.panes.right
      , height : 8
      , top    : 92
      })

    // the main game feed
    this.feed = Feed.of({screen, max_buffer_size, title
      , parent : this.panes.right
      , height : 92
      })
    // write game feed
    parser.on("tag", (tag : Koschei.Tag) => {
      if (tag.text.trim().length == 0) return // empty
      this.route(tag)
    })

    screen.key(['escape', 'C-c'], _ => process.exit(0))
    
    this.input.on("user:command", (command : any) => {
      this.feed.rpush(
        Koschei.Tag.of("user:command", {}, command.to_feed))
      this.parser.socket.write(`${command.to_game}\n`)
    })
    
  }
  render () {
    this.screen.render()
  }
  route (tag : Koschei.Tag) {
    //process.emit("log" as any, tag as any)
    switch (tag.name) {
      case "cast"       : return this.onhand(tag)
      case "left"       : return this.onhand(tag)
      case "right"      : return this.onhand(tag)
      case "text"       : return this.ontext(tag)
      case "preset"     : return this.ontext(tag)
      case "style"      : return this.onstyle(tag)
      case "stream"     : return this.onstream(tag)
      case "dialogdata" : return this.ondialog(tag)
      case "progressbar": return this.onprogress(tag)
      case "prompt"     : return this.onprompt(tag)
    }
  }

  onlog (thing : any) {
    if (!this.log) return
    this.log.write(util.inspect(thing) + "\n")
  }

  onstream (tag : Koschei.Tag) {
    switch (tag.id) {
      case "thoughts" : return this.feed.rpush(tag)
      default: // omit
    }
  }
  onprogress (tag : Koschei.Tag) {
    //this.onlog(tag)
  }
  ondialog (tag : Koschei.Tag) {
    tag.children.map(this.route, this)
  }
  ontext (tag : Koschei.Tag) {
    this.feed.rpush(tag)
  }
  onhand (tag : Koschei.Tag) {

  }
  onstyle (tag : Koschei.Tag) {
    this.feed.rpush(tag)
    if (tag.id == "roomName") this.feed.set_title(tag.text.trim())
  }
  onprompt (tag : Koschei.Tag) {
    this.input.set_prompt(tag.text)
    this.server_offset = Number(tag.attrs.time) - Date.now()
    this.feed.rpush(tag)
  }
}