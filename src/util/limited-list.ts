
export interface ListOpts {
  limit : number;
}
export default class LimitedList<A> {
  static of<A>(members : Array<A> = [], opts : ListOpts) {
    return new LimitedList<A>(members, opts)
  }
  members : Array<A>;
  limit   : number;
  constructor (members : Array<A>, opts : ListOpts) {
    this.members = members;
    this.limit   = opts.limit;
  }
  get size () {
    return this.members.length
  }
  get length () {
    return this.size
  }
  get last () {
    return this.members[this.members.length-1]
  }
  lpop () {
    return this.members.shift()
  }
  rpush (t : A) {
    this.members.push(t)
    while (this.size > this.limit) this.lpop()
    return this
  }
}