import Blessed from "blessed"
import View, {IView}    from "./view"
import * as Koschei from "@elanthia/koschei";

export default class Hand extends View<Blessed.Widgets.BoxElement> {
  static DULL = "#ffffff"
  static BRIGHT = "#0B8185"
  static of (opts: IView<Blessed.Widgets.BoxElement>) {
    return new Hand(opts)
  }
  constructor (opts : IView<Blessed.Widgets.BoxElement>) {
    super(opts)/*Object.assign(opts, 
      { box: Blessed.box(
        { height : "100%"
        , width  : "33%"
        , left   : `${opts.left}%`
        , parent : opts.parent
        , border  : {type: "line", fg: Hand.DULL} as any
        , padding : 0
        })
      }))*/
  }
  update (tag : Koschei.Tag) {
    this.ele.setContent(tag.text)
    if (tag.attrs.exist) this.border_color(Hand.BRIGHT)
    else this.border_color(Hand.DULL)
    this.redraw()
  }
  
  border_color (color : string) {
    if (this.ele.border && this.ele.border.fg) {
      this.ele.border.fg = color as any
    } 
  }
}