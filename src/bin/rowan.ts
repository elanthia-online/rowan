#!/usr/bin/env node
import * as Tasks from "../tasks"
import ARGV       from "../util/argv"

const fail = (err : Error) => {throw err}

export default (async function main () {
  await Tasks.first_run()
  await Tasks.start(ARGV.parse())
}())
