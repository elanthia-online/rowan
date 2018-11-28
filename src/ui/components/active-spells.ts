import Contrib       from "blessed-contrib"
import View, {IView} from "./view"
import * as Koschei  from "@elanthia/koschei";

export default class ActiveSpells extends View<Contrib.Widgets.TableElement> {
  static of (opts: IView<Contrib.Widgets.TableElement>) {
    return new ActiveSpells(opts)
  }
  constructor (opts : IView<Contrib.Widgets.TableElement>) {
    super(opts)
  }
  update (tag : Koschei.Tag) {
    this.ele.setData(
      { headers : []
      , data    : tag.children.filter(tag => tag.name == "label")
                  .map(tag => [ tag.attr("anchor_right")
                              , tag.attr("value").trim()
                              ])
      })
  }
}