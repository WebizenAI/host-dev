#!/usr/bin/env node

var debug = require('debug')('groupuris-cli')
var groupuris = require('../')
var program = require('commander')

program
  .parse(process.argv)

var agents = ['https://melvincarvalho.com/#me', 'http://csarven.ca/#i']
debug(program.args)
if (program.args.length !== 0) {
  agents = program.args
}

var turtle = groupuris.agentsToGroup(agents)
var hash = groupuris.toSha256Base64url(turtle)

debug(turtle)
console.log(hash)
