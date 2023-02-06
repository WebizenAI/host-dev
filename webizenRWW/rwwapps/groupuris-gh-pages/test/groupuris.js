var groupuris = require('../')

var expect = require('chai').expect

describe('Groupuris Functions', function () {

  describe('agentsToGroup', function () {
    it('agentsToGroup is a function', function () {
      expect((groupuris.agentsToGroup)).to.be.a('function')
    })

    var agents = ['https://melvincarvalho.com/#me', 'http://csarven.ca/#i']

    var group = '_: <https://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2006/vcard/ns#Group> .\n\
_: <http://www.w3.org/2006/vcard/ns#hasMember> <http://csarven.ca/#i> .\n\
_: <http://www.w3.org/2006/vcard/ns#hasMember> <https://melvincarvalho.com/#me> .\n'

    it('test agentsToGroup([\'https://melvincarvalho.com/#me\', \'http://csarven.ca/#i\']) = \'' + group + '\'', function () {
      expect((groupuris.agentsToGroup(agents))).to.equal(group)
    })
  })

  describe('toSha256Base64url', function () {
    it('toSha256Base64url is a function', function () {
      expect((groupuris.toSha256Base64url)).to.be.a('function')
    })

    var group = '_: <https://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2006/vcard/ns#Group> .\n\
_: <http://www.w3.org/2006/vcard/ns#hasMember> <http://csarven.ca/#i> .\n\
_: <http://www.w3.org/2006/vcard/ns#hasMember> <https://melvincarvalho.com/#me> .\n'

    var base64url = 'AO8kEF3c6teJ0n8fJ20_JZEosg4klzFF2vQOf-pTzkg'

    it('test agentsToGroup([\'' + group + '\']) = \'' + base64url + '\'', function () {
      expect((groupuris.toSha256Base64url(group))).to.equal(base64url)
    })
  })

})
