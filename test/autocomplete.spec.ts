import o from "ospec"
import Autocomplete from "../src/autocomplete/autocomplete"

o("compares history (qwerty distance and best exact)", function () {
  const {suggestions} = Autocomplete.of("put taters", 
    [ "a bunch of nonsense"
    , "put taters in my backpack"
    , "out taters in my backpack"
    , "put taters"
    , "some other nonsense"
    , "a put"
    ])

  o(suggestions)
    .deepEquals(
      [ "put taters in my backpack"
      , "out taters in my backpack"
      , "a put"
      ])
})
