module.exports = {
  agentsToGroup: agentsToGroup,
  toSha256Base64url: toSha256Base64url
}

var debug = require('debug')('groupuris')
var base64url = require('base64-url')
var SHA256 = require('crypto-js/sha256')
var hex64 = require('hex64')

/**
 * Creates a group from a list of agents
 * @param  {Array} agents Array of agents
 * @return {String}       Turtle for a vcard group
 */
function agentsToGroup (agents) {
  var group = '_: <https://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2006/vcard/ns#Group> .\n'

  agents = agents.sort()

  for (var i = 0; i < agents.length; i++) {
    var agent = agents[i]
    group += '_: <http://www.w3.org/2006/vcard/ns#hasMember> <' + agent + '> .\n'
  }
  return group
}

/**
 * create base64url of sha256 hash from string
 * @param  {string} str The string to hash
 * @return {string}     The hash
 */
function toSha256Base64url (str) {
  var hash = SHA256(str).toString()
  debug('str', str)
  debug('sha256', hash)
  var base64 = hex64.encode(hash)
  base64 = base64url.escape(base64)
  debug('base64url', base64)
  return base64
}
