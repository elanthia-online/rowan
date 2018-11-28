import * as Koschei from "@elanthia/koschei"
import Blessed     from "blessed"
import Contrib     from "blessed-contrib"
import Feed         from "./components/feed"
import Input, { CLIMenu } from "./components/input"
import { EventEmitter } from "events"
import Hand from "./components/hand"
import ActiveSpells from "./components/active-spells"
import Hilite from "../hilite/hilite"
declare type HandName =
  | "spell"
  | "right"
  | "left"
declare interface AppOpts {
  title : string;
  max_buffer_size? : number;
  parser : Koschei.Bridge;
}
declare type DOMMap = {
  feed          : Feed;
  input         : Input;
  left_hand     : Hand;
  right_hand    : Hand;
  spell         : Hand;
  active_spells : ActiveSpells;
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
  static layout (app : App, screen: Blessed.Widgets.Screen, grid : Contrib.Widgets.GridElement) {
    // left pane
    const active_spells =
      grid.set(2, 0, 12, 4, Contrib.table,
        { keys          : true
        , fg            : 'white'
        , interactive   : false
        , label         : 'active spells'
        , border : {type: "line", fg: "cyan"} 
        , columnSpacing : 0 //in chars
        , columnWidth   : [24, 5] /*in chars*/ 
        })
    // right pane
    const left_hand = 
      grid.set(0, 5, 2, 5, Blessed.box, 
        { label: "left"
        , border : {type: "line", fg: "cyan"}
        })
    const right_hand = 
      grid.set(0, 10, 2, 5, Blessed.box, 
        { label: "right"
        , border : {type: "line", fg: "cyan"} 
        })
    const spell = 
      grid.set(0, 15, 2, 5, Blessed.box, 
        { label: "spell"
        , border : {type: "line", fg: "cyan"} 
        })
    const feed =
      grid.set(2, 4, 20, 20, Blessed.box, 
        { scrollable   : true
        , tags         : true
        , mouse        : true
        , keys         : true
        , alwaysScroll : true
        , scrollbar    : { ch: "|", style: {bg: "#BDEB07"}}
        })
    const input =
      grid.set(24 - 2, 4, 2, 20, Blessed.textarea, 
        { label: ">"
        , inputOnFocus : true
        , scrollable : false
        , border : {type: "line", fg: "cyan"} 
        })

    return {
      left_hand, right_hand, spell, feed, input
    , active_spells
    }
  }
  readonly screen : Blessed.Widgets.Screen;
  readonly parser : Koschei.Bridge;
  readonly grid : Contrib.Widgets.GridElement;
  readonly dom  : DOMMap
  prompt : string;
  server_offset : number;
  constructor ({title, parser} : AppOpts) {
    super()
    const app   = this
    this.parser = parser
    this.prompt = ">"
    this.server_offset = 0

    //const dom = this.dom = {} as DOMLayout

    const screen = this.screen = 
      Blessed.screen(
        { smartCSR    : true
        , cursor      : CURSOR_OPTS
        , dockBorders : true
        , title       : title
        })

    const grid = this.grid = 
      new Contrib.grid(
        { rows   : 24
        , cols   : 24
        , hideBorder : true
        , screen : screen
        })

    const dom = App.layout(app, screen, grid)

    this.dom = 
      { right_hand : Hand.of({app, screen, ele: dom.right_hand})
      , left_hand  : Hand.of({app, screen, ele: dom.left_hand})
      , spell      : Hand.of({app, screen, ele: dom.spell})
      , feed       : Feed.of({app, screen, ele: dom.feed})
      , input      : Input.of({app, screen, ele: dom.input})
      , active_spells : ActiveSpells.of({app, screen, ele: dom.active_spells})
      }

    // write game feed
    parser.on("tag", (tag : Koschei.Tag) => {
      if (tag.text.trim().length == 0) return // empty
      app.route(tag)
    })

    screen.key(['escape', 'C-c'], _ => process.exit(0))
    
    app.on("cli", (command : any) => {
      this.dom.feed.rpush(
        Koschei.Tag.of("cli", {}, command.to_feed))
      app.parser.socket.write(`${command.to_game}\n`)
    })
    
    app.on("menu", ({id, options} : CLIMenu) => {
      this.dom.feed.rpush(
        Hilite.renderable(
          Koschei.Tag.of("menu", {id}, 
          `Menu[:${id}]\n` + options.map(
            (option : any, id : number) => `${id} > ${option.text}`)
          .join("\n"))))
    })

    this.on("error", ({id, text})=> {
      debugger;
      if (id && text) this.dom.feed.rpush(
        Koschei.Tag.of("error", {id}, text))
    })
    this.redraw()
  }
  redraw () {
    this.screen.render()
  }
  route (tag : Koschei.Tag) {
    //this.emit("log", tag)
    switch (tag.name) {
      case "spell"      : return this.onhand(tag)
      case "left"       : return this.onhand(tag)
      case "right"      : return this.onhand(tag)
      case "text"       : return this.ontext(tag)
      case "preset"     : return this.ontext(tag)
      case "style"      : return this.onstyle(tag)
      case "stream"     : return this.onstream(tag)
      case "dialogdata" : return this.ondialog(tag)
      case "progressbar": return this.onprogress(tag)
      case "prompt"     : return this.onprompt(tag)
      default : this.emit("log", [":unhandled", tag])
    }
  }

  onstream (tag : Koschei.Tag) {
    switch (tag.id) {
      case "thoughts" : return this.dom.feed.rpush(tag)
      default: // omit
    }
  }
  onprogress (tag : Koschei.Tag) {
    //this.onlog(tag)
  }
  ondialog (tag : Koschei.Tag) {
    switch ((tag.id || "").toLowerCase()) {
      case "activespells": return this.dom.active_spells.update(tag)
    }
  }
  ontext (tag : Koschei.Tag) {
    this.dom.feed.rpush(tag)
  }
  onhand (tag : Koschei.Tag) {
    this.emit("log", tag)
    switch (tag.name as HandName) {
      case "left" : return this.dom.left_hand.update(tag)
      case "right": return this.dom.right_hand.update(tag)
      case "spell": return this.dom.spell.update(tag)
    }
  }
  onstyle (tag : Koschei.Tag) {
    this.dom.feed.rpush(tag)
    if (tag.id == "roomName") this.dom.feed.set_title(tag.text.trim())
  }
  onprompt (tag : Koschei.Tag) {
    this.dom.input.set_prompt(tag.text)
    this.server_offset = Number(tag.attrs.time) - Date.now()
    this.dom.feed.rpush(tag)
  }
}