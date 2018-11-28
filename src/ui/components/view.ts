import {EventEmitter} from "events"
import Blessed        from "blessed"
import App            from "../app"
export type ViewOpts<T> = {
  ele    : T;
  screen : Blessed.Widgets.Screen;
  app    : App;
}
export interface IView<T> {
  ele     : T;
  screen  : Blessed.Widgets.Screen;
  app     : App;
}
export default class View<T> extends EventEmitter {
  public ele    : T;
  public screen : Blessed.Widgets.Screen;
  public app    : App;
  constructor ({ele, screen, app} : ViewOpts<T>) {
    super()
    this.app    = app
    this.ele    = ele
    this.screen = screen
  }
  log (t : any) {
    this.emit("log", t)
  }
  redraw () {
    this.screen.render()
  }
}