import o from "ospec"
import Qwerty from "../src/autocomplete/qwerty"

o("creates uniq pairs woh reasonable weights", function () {
  // should be no distance
  o(Qwerty.distance("a", "a"))
    .equals(0)
  // should be really far apart
  o(Qwerty.distance("`", "?") > (Qwerty.distance("a", "x") * 2))
    .equals(true)

  o(Qwerty.distance("a", "g") > Qwerty.distance("a", "x"))
    .equals(true)
})

o("Qwerty.word_distance() is reasonable", function () {
  o(Qwerty.word_distance("rot", "mot") > Qwerty.word_distance("qwamp", "swamp"))
    .equals(true)
})