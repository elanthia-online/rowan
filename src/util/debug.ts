import { EventEmitter } from "events"
import util from "util"
import path from "path"
import fs   from "fs"
import touch from "touch"

declare interface DebugOpts {
  logs?    : string;
  emitters : Array<EventEmitter>;
}

export default class Debug {
  static async create_log_file (root? : string) {
    const log_dir : string[] = []

    if (root) log_dir.push(root) 
    else log_dir.push(process.cwd(), "log")

    const file = path.join(...log_dir, "debug.log")

    await touch(file)

    return file
  }

  static inspect (emitter : EventEmitter, arg : any) {
    return util.inspect([emitter.constructor.name, arg]) + "\n"
  }

  static async attach (opts : DebugOpts) {
    const log = fs.createWriteStream(
      await Debug.create_log_file(opts.logs))

    opts.emitters.forEach(emitter => emitter
      .on("log", arg => log
      .write(Debug
      .inspect(emitter, arg))))
  }
}