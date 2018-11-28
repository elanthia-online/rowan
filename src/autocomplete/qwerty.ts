import * as List from "../util/list"
import Pipe, {Functor} from "@elanthia/koschei/dist/util/pipe"
declare type Rune =
  | string
declare type Coord =
  | [number, number, number]
declare type CoordList =
  | Array<Coord>
declare type RuneList =
  | Array<Rune>
declare type RuneMatrix =
  | Array<RuneList>
declare type CoordMap =
  | Record<Rune, Coord>
export default class Qwerty {
  static NORMAL =
    Qwerty.build_coords({z: 0}, 
      [ `\`1234567890-=`
      , ` qwertyuiop[]\\`
      , ` asdfghjkl;'`
      , ` zxcvbnm,./`
      ])
  static SHIFT =
    Qwerty.build_coords({z: 1}, 
      [ `~!@#$%^&*()_+`
      , ` QWERTYUIOP{}|`
      , ` ASDFGHJKL:"`
      , ` ZXCVBNM<>?`
      ])
  static RUNE_MAP = Object.assign({}, Qwerty.NORMAL, Qwerty.SHIFT)
  static EMPTY = ` `
  static EMPTY_DISTANCE = 1.0
  static UNKNOWN_CHAR_DISTANCE = 10.0
  static euclidean_distance ([x1, y1, z1] : Coord, [x2, y2, z2] : Coord) : number {
    return Math.sqrt(
     (Math.pow((x1-x2), 2) + Math.pow((y1-y2), 2) + Math.pow((z1-z2), 2)))
  }
  static distance (a : Rune, b : Rune) {
    if (a == b) return 0
    if (a == Qwerty.EMPTY || b == Qwerty.EMPTY) return Qwerty.EMPTY_DISTANCE
    if (!Qwerty.RUNE_MAP[a] || !Qwerty.RUNE_MAP[b]) return Qwerty.UNKNOWN_CHAR_DISTANCE
    const [coord1, coord2] = ([a,b] as RuneList).map((rune : string) => Qwerty.RUNE_MAP[rune])
    return Qwerty.euclidean_distance(coord1, coord2)
  }
  static to_rune_matrix (runelist : RuneList) : RuneMatrix {
    return runelist.map( 
      (row : string) => row.split(""))
  }
  static build_coords ({z = 0}, layout : RuneList) : CoordMap {
    return Pipe.of(layout)
      .fmap(Qwerty.to_rune_matrix)
      .fmap(List.reduce as Functor<RuneMatrix, CoordMap>, {}, 
        (acc : CoordMap, row : RuneList, x : number) => row
          .reduce((acc, char, y) => Object
          .assign(acc, {[char] : [x, y, z]}), acc))
      .data
  }
  static word_distance (word1: string, word2: string) : number {
    return Pipe.of(List.zip(word1.split(""), word2.split("")))
      .fmap(List.reduce as Functor<RuneMatrix, number>, 0,
        (score : number, [a, b] : RuneList) => score + Qwerty.distance(a, b))
      .data
  }
}