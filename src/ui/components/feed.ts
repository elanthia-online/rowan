import Blessed, { line }      from "blessed"
import * as Koschei from "@elanthia/koschei"
import Pane         from "./pane"
import Hilite, {TextOffset} from "../../hilite/hilite"
export interface FeedOpts {
  max_buffer_size? : number;
  screen    : Blessed.Widgets.Screen;
  parent?   : Pane;
  title     : string;
  height? : number;
  top?    : number;
}

export default class Feed {
  static MAX_BUFFER_SIZE = 1000
  static SKIPPABLE =
    [ "prompt"
    , "user:command"
    ]
  static of (opts: FeedOpts) {
    return new Feed(opts)
  }
  static is_skippable (tag : Koschei.Tag) : boolean {
    return Feed.SKIPPABLE.indexOf(tag.name) > -1
  }
  static prepare_text (tag : Koschei.Tag) : string {
    let text = tag.text
    if (tag.children.length) {
      const hilited = tag.children.concat(tag).reduce((compiler : TextOffset, child : Koschei.Tag)=> {
        return Hilite.inject_tag_color(compiler, child)
      }, {offset: 0, text})
      //process.emit("log" as any, hilited as any)
      text = hilited.text
    }
    return text.trim()
  }
  tags    : Array<Koschei.Tag>;
  max_buffer_size : number;
  box   : Blessed.Widgets.BoxElement;
  screen   : Blessed.Widgets.Screen;
  parent   : Blessed.Widgets.Node;
  constructor ({max_buffer_size = Feed.MAX_BUFFER_SIZE, parent, height, top = 0, screen} : FeedOpts) {
    this.tags    = []
    this.max_buffer_size = max_buffer_size
    this.screen   = screen
    this.parent   = parent ? parent.box : screen
    this.box   = Blessed.box(
      { parent       : this.parent
      , height       : `${height}%`
      , top          : `${top}%`
      , border       : {type: "line", fg: "#BDEB07"} as any
      , scrollable   : true
      , tags         : true
      , mouse        : true
      , keys         : true
      , alwaysScroll : true
      , scrollbar    : { ch: "|", style: {bg: 'yellow'}}
      })
  }
  set_title (title : string) {
    this.box.setLabel(title)
  }
  rpush (tag : Koschei.Tag) {
    const last_tag = this.tags[this.tags.length-1]
    if (last_tag && Feed.is_skippable(last_tag) && Feed.is_skippable(tag) && tag.name == "prompt") return
    this.tags.push(tag)
    while (this.tags.length > this.max_buffer_size) {
      this.lpop()
      this.box.shiftLine(1)
    }
    this.box.pushLine(
      Feed.prepare_text(tag))
    this.box.setScrollPerc(100)
    this.screen.render()
    return this
  }
  lpop () {
    return this.tags.shift()
  }
}