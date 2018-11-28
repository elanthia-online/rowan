export interface IPipe<T> {
  readonly value: () => T;
  fmap<R>(fn: (x: T) => R): IPipe<R>;
}

export default function Pipe<T>(val: T): IPipe<T> {
  return {
    fmap: (fn) => Pipe(fn(val))
  , value: () => val
  }
}

Pipe.of = Pipe