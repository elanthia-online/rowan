import o from "ospec"
import * as List from "../src/util/list"

o("List.zip", function () {
  o(List.zip("taters".split(""), "ta".split("")))
    .deepEquals(
      [ ["t", "t"]
      , ["a", "a"]
      ])
})