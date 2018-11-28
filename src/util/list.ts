declare interface UniqReducer {
  exists: Record<string, true>;
  list : Array<string>;
}
export function uniq (list : string[]) {
  return list.reduce( (acc : UniqReducer, member : string)=> { 
    if (acc.exists[member]) return acc
    acc.exists[member] = !!1
    acc.list.push(member)
    return acc
  }, {list: [], exists:{}} as UniqReducer).list
}
export function uniq_pairs<T> (list : Array<T>, depth = 0) : Array<[T, T, number]>{
    if (list.length < 2) return []
    const [first, ...rest] = list
        , pairs = rest.map((x : T, idx) : [T, T, number]=> [first, x, idx + depth])
    return pairs.concat(uniq_pairs(rest, depth + 1))
}
export function flatten (...args : any[]) {
  return [].concat.apply([], ...args)
}
export function zip (...lists : any[]) {
  lists = lists.sort((a,b)=> a.length - b.length)
  const shortest_list = lists[0]
  return shortest_list.reduce((acc : any[], _ : never, i : number)=> {
    acc.push(lists.map(list => list[i]))
    return acc
  }, [])
}
export function reduce<T>(list : any[], start_value: T ,fn : ()=> T) : T {
  return list.reduce(fn, start_value)
}
export function map<T>(list : Array<T>, fn : ()=> T) : Array<T> {
  return list.map(fn)
}
export function filter<T>(list : Array<T>, fn : ()=> T) : Array<T> {
  return list.filter(fn)
}

export function head<T> (list : Array<T>) : T {
  return list[0]
}
export function concat<T> (lists : Array<Array<T>>) : Array<T> {
  return reduce(lists, [] as Array<T>, 
    ((acc : Array<T>, list : Array<T>) => acc.concat(list)) as any)
}

export function slice<T> (list : Array<T>, {start = 0, end = list.length}) : Array<T> {
  return list.slice(start, end)
}
export function inspect (this: any, ele : any) {
  const inspector = this
  if (typeof inspector == "function") inspector(ele)
  else console.log(ele)
  return ele
}