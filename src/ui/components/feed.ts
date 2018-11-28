import Blessed  from "blessed"
import * as Koschei from "@elanthia/koschei"
import Hilite, {TextOffset} from "../../hilite/hilite"
import App       from "../app"
import clipboard from "clipboardy"
import View, {IView}  from "./view"
import Text      from "../../text"
export type FeedOpts<T> = IView<T> & {
  max_buffer_size? : number;
}
export default class Feed extends View<Blessed.Widgets.BoxElement> {
  static BASH_CODES = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g
  static MAX_BUFFER_SIZE = 1000
  static SKIPPABLE =
    [ "prompt"
    , "user:command"
    ]
  static of (opts: FeedOpts<Blessed.Widgets.BoxElement>) {
    return new Feed(opts)
  }
  static is_skippable (tag : Koschei.Tag) : boolean {
    return Feed.SKIPPABLE.indexOf(tag.name) > -1
  }
  static prepare_text (tag : Koschei.Tag) : string {
    let text : string = tag.text
    if (tag.children.length) {
      const hilited = tag.children.concat(tag).reduce((compiler : TextOffset, child : Koschei.Tag)=> {
        return Hilite.inject_tag_color(compiler, child)
      }, {offset: 0, text})
     
      text = Text.decode(hilited.text)
    }
    return text.trimRight()
  }
  tags    : Array<Koschei.Tag>;
  max_buffer_size : number;
  app : App;
  constructor ({app, ele, screen} : FeedOpts<Blessed.Widgets.BoxElement>) {
    super({screen, app, ele})
    this.max_buffer_size = Feed.MAX_BUFFER_SIZE
    this.tags   = []
    this.app    = app
    this.ele.on("click", ()=> this.screenshot())
  }
  async screenshot () {
    const screenshot = this.ele.screenshot() as unknown as string
    
    await clipboard.write(
      screenshot.replace(Feed.BASH_CODES, ""))
  }
  set_title (text : string) {
    this.ele.setLabel({text, side: "right"})
  }
  clear_menus () {
  }
  rpush (tag : Koschei.Tag) {
    const last_tag = this.tags[this.tags.length-1]
    if (last_tag && Feed.is_skippable(last_tag) && Feed.is_skippable(tag) && tag.name == "prompt") return
    this.tags.push(tag)
    while (this.tags.length > this.max_buffer_size) {
      this.lpop()
      this.ele.shiftLine(1)
    }
    this.log(tag.text)
    this.ele.pushLine(
      Feed.prepare_text(tag))
    this.ele.setScrollPerc(100)
    this.screen.render()
    return this
  }
  lpop () {
    return this.tags.shift()
  }
}