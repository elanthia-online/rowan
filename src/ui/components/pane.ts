import blessed from "blessed"
import { EventEmitter } from "events"

export interface PaneOpts {
  screen    : blessed.Widgets.Screen;
  width?  : number;
  height? : number;
  left?: number;
  top?: number;
}

export default class Pane extends EventEmitter {

  static of (opts: PaneOpts) {
    return new Pane(opts)
  }
  box   : blessed.Widgets.BoxElement;
  constructor ({screen, width = 100, height = 100, left = 0, top = 0} : PaneOpts) {
    super()
    this.box = blessed.box(
      { width  : `${width}%`
      , height : `${height}%`
      , left   : `${left}%`
      , top    : `${top}%`
      , parent : screen
      })
  }
}