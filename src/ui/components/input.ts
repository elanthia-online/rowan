import blessed from "blessed"
import { EventEmitter } from "events"
import Pane from "./pane"

export interface InputOpts {
  screen    : blessed.Widgets.Screen;
  parent?   : Pane;
  height    : number;
  top       : number;
}

export default class Input extends EventEmitter {

  static of (opts: InputOpts) {
    return new Input(opts)
  }

  readonly lines    : Array<string>;
  readonly box   : any;
  readonly screen   : blessed.Widgets.Screen;

  readonly parent   : blessed.Widgets.Node;

  prompt            : string;
  constructor ({screen, parent, height, top} : InputOpts) {
    super()
    this.lines  = []
    this.prompt = ">"
    this.screen = screen
    this.parent = parent ? parent.box : screen
    this.box = blessed.textarea(
      { height  : `${height}%`
      , top     : `${top}%`
      , border  : {type: "bg", fg: "#30d03d"} as any
      , bg      : "#3d3d3d"
      , padding : 0
      , parent  : this.parent
      , inputOnFocus : true
      , scrollable : false
      })
    this.box.focus()

    this.box.key(['escape', 'C-c'], function() {
      process.exit(0);
    })

    this.box.key(["enter"], ()=> {
      this.emit("user:command", 
        { to_game: this.input()
        , to_feed: this.prompt + this.input()
        })
      this.box.clearValue()
      this.screen.render()
      //this.input(this.prompt)
    })

    this.screen.render()
    //this.input(this.prompt)
  }
  
  input (val? : string) : string {
    if (!val) return this.box.value
    this.box.value = val
    this.screen.render()
    return this.box.value
  }

  input_without_prompt () {
    const prev_prompt_size = this.prompt.length
    const prev_input  = this.input()
    return prev_input.slice(prev_prompt_size, prev_input.length)
  }

  set_prompt (val : string) {
    //const value = this.input_without_prompt()
    this.prompt = val
    //return this.input(this.prompt + value)
  }
}