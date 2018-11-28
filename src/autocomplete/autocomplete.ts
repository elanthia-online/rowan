import Pipe, {IPipe} from "../util/pipe"
import * as List from "../util/list"
import Qwerty from "./qwerty"

(Object as any).prototype.tap = function (fn : any) {
  fn(this)
  return this
}
declare type Suggestions =
  | Array<string>
declare type Command =
  | string
declare type SuggestionsAccumulator =
  | [Command, Suggestions]
declare type QwertyTuple =
  | [string, number]
export default class Autocomplete {
  static MIN_CLOSENESS_SCORE = 25
  /**
   * Suggestion sorting algorithm based on QWERTY keyboard layouts
   * where a lower score indicates similarity to the command we
   * are trying to build a suggestion list for
   */
  static qwerty_distance_suggestions ([command, suggestions] : SuggestionsAccumulator) : SuggestionsAccumulator {
    return [ command
           , Autocomplete.qwerty_sort([command, suggestions])
           ]
  }
  static qwerty_sort ([command, suggestions] : SuggestionsAccumulator) {
    return suggestions
    .map(suggestion => suggestion.padEnd(command.length, " "))
    .map((suggestion : string) : QwertyTuple=> [suggestion, 
      Qwerty.word_distance(command, suggestion)])
        .sort(([, a] : QwertyTuple, [, b] : QwertyTuple)=> a - b)
        .filter(([_, score])=> score < Autocomplete.MIN_CLOSENESS_SCORE)
        .map(([suggestion, _]) => suggestion.trimRight())
  }
  static prune ([command, suggestions] : SuggestionsAccumulator) : SuggestionsAccumulator {
    return [ command 
           , suggestions.filter(
              (suggestion : string) => suggestion.startsWith(command))
           ]
  }
  static lift ([_, suggestions] : SuggestionsAccumulator) : Suggestions {
    return suggestions
  }
  static of (command: string, history : string[]) {
    return new Autocomplete(command, history)
  }
  suggestions : Suggestions;
  best_guesses : Suggestions;
  best_matches : Suggestions;
  constructor (command: string, history : string[]) {
    const _prepared = Pipe.of([command.trim(), 
      List.uniq(history)
          .filter(suggestion => command.trim() !== suggestion.trim())]) as Pipe<SuggestionsAccumulator>
    // best matches are exact
    this.best_matches = 
      _prepared
        .fmap(Autocomplete.prune)
        .fmap(Autocomplete.lift)
        .value()
    // this is more like autocorrect in that it checks for
    // likely mistypes
    this.best_guesses =
      _prepared
        .fmap(Autocomplete.qwerty_distance_suggestions)
        .fmap(Autocomplete.lift)
        .value()
    // built our list of unique suggestions
    // without altering order
    this.suggestions = 
      List.slice(
        Pipe.of([this.best_matches, this.best_guesses])
        .fmap(List.concat)
        .fmap(List.uniq)
        .value(), {end: 9})
  }
}