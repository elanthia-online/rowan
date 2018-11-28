import Blessed from "blessed"
import View, {IView} from "./view";
import LimitedList from "../../util/limited-list";
import Autocomplete from "../../autocomplete/autocomplete";
export interface CLIOption {
  text   : string;
  attrs? : Record<string, string>;
}
export interface CLIMenu {
  options : Array<CLIOption>;
  id      : string;
}

export default class Input extends View<Blessed.Widgets.TextareaElement> {
  static of (opts: IView<Blessed.Widgets.TextareaElement>) {
    return new Input(opts)
  }
  readonly lines    : Array<string>;
  prompt            : string;
  history           : LimitedList<string>;
  histIdx           : number;
  menu?             : CLIMenu;
  constructor ({screen, ele, app} : IView<Blessed.Widgets.TextareaElement>) {
    super({app, screen,ele})
    this.lines    = []
    this.history  = LimitedList.of([], {limit: 100})
    this.histIdx  = -1
    this.prompt   = ">"
    this.ele.focus()

    this.ele.key(['escape', 'C-c'], _ => process.exit(0))

    this.ele.key("up", ()=> {
      // rollover
      if (this.histIdx == (this.history.size - 1)) {
        this.histIdx = -1
        return this.clear()
      }
      ++this.histIdx
      this.log([":up", this.histIdx, this.history])
      this.input(
        this.history.ago(this.histIdx, ""))
    })

    this.ele.key("tab", ()=> {
      const current_command = this.input()
      if (current_command.trim().length == 0) return false
      const {suggestions} = Autocomplete.of(current_command, this.history.toArray())
      if (suggestions.length == 1) return this.input(suggestions[0])
      this.input(this.input().trim())
      if (suggestions.length == 0) {
        return this.app.emit("error", 
          { id   : "autocomplete"
          , text : "no suggestions" 
          })
      }
      this.app.emit("menu", 
        { id      : "autocomplete"
        , options : suggestions.map((text)=> Object.assign({}, {text}))
        })
    })

    this.app.on("menu", (menu : CLIMenu) => {
      this.menu = menu
    })

    Array(10).fill(1).forEach((_, num)=> this.handle_num_press(num))

    this.ele.key("down", ()=> {
      // clear
      if (this.histIdx < 1) {
        this.histIdx = -1
        return this.clear()
      }
      --this.histIdx
      this.log([":down", this.histIdx, this.history])
      this.input(
        this.history.ago(this.histIdx, ""))
    })

    this.ele.key(["enter"], ()=> {
      this.menu = void(0)
      const command = this.input().trim()
      if (command.length == 0) return
      this.history.rpush(command)
      app.emit("cli", 
        { to_game: this.input()
        , to_feed: this.prompt + this.input()
        })
      this.clear()
    })
    this.redraw()
  }

  clear () {
    this.ele.clearValue()
    this.redraw()
  }
  handle_num_press (num : number) {
    this.ele.key(`${num}`, _ => {
      if (!this.menu) return
      const option = this.menu.options[num]
      if (option) return this.input(option.text)
    })
  }
  input (val? : string) : string {
    if (!val) return this.ele.value
    this.ele.setValue(val)
    this.redraw()
    return this.ele.value
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