import * as Koschei         from "@elanthia/koschei"
import DEFAULT_COLOR_SCHEME from "./color-scheme"

export interface TextOffset {
  text   : string;
  offset : number;
}

export interface HilitedOffset {
  hilited : string;
  offset  : number;
}
export default class Hilite {
  static DEFAULT_COLOR_SCHEME = DEFAULT_COLOR_SCHEME
  // serves as the accumulator 
  // for user-land preferences
  // and internal defaults
  static COLOR_SCHEME = {} as Record<string, string>
  static async load_color_scheme (profile : string) {
    if (profile) {
      // todo: load user colors
    }
    Object.assign(Hilite.COLOR_SCHEME, DEFAULT_COLOR_SCHEME)
  }
  static async load_user_patterns () {
    // todo: load user patterns
  }
  static inject_tag_color (compiler : TextOffset, tag : Koschei.Tag) : TextOffset {
    if (typeof tag.start !== "number" || typeof tag.end !== "number") return compiler
    const before  = compiler.text.substr(0, tag.start + compiler.offset)
    const after   = compiler.text.substr(tag.end + compiler.offset, compiler.text.length)
    const {hilited, offset} = Hilite.color(tag.id || tag.name, tag.text)
    const text = before + hilited + after
    return {text, offset : offset + compiler.offset}
  }
  static color (kind : string, text : string) : HilitedOffset {
    const color = Hilite.COLOR_SCHEME[kind]
    if (typeof color == "undefined") return {hilited : text, offset: 0}
    const body = `${color}-fg`
    const hilited = `{${body}}${text}{/${body}}`
    return {hilited, offset : ((body.length + 2) * 2) + 1}
  }
  /**
   * helper to easily create a hilite renderable tag
   */
  static renderable (tag : Koschei.Tag) {
    // dummy wrapper that we can use as a
    // renderable entry point for the rendering engine
    const wrapper = 
      Koschei.Tag.of("text", {id : tag.id as string})
    // give it a pseudo range
    tag.start = 0
    tag.end   = tag.text.length
    // add it to the parent wrapper
    wrapper.add_child(tag)
    // return the parent wrapper for the rendering engine
    return wrapper
  }
}