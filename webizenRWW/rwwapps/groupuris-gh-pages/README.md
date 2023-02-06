<a href="https://nodei.co/npm/groupuris/"><img src="https://nodei.co/npm/groupuris.png?downloads=true"></a>

[![NPM Version](https://img.shields.io/npm/v/groupuris.svg?style=flat)](https://npm.im/groupuris)
[![Build Status](https://travis-ci.org/melvincarvalho/groupuris.svg?branch=master)](https://travis-ci.org/melvincarvalho/groupuris)


### Group URIs

Implementation of the [groupuris](
https://solid-live.github.io/specs/groupuris/) spec

#### install:
```bash
npm install -g groupuris
```

#### commandline:
```bash
$ groupuris https://melvincarvalho.com/#me http://csarven.ca/#i
AO8kEF3c6teJ0n8fJ20_JZEosg4klzFF2vQOf-pTzkg
```

#### node:
```js
var groupuris = require('groupuris');

var agents = ['https://melvincarvalho.com/#me', 'http://csarven.ca/#i']
var turtle = groupuris.agentsToGroup(agents)
var hash = groupuris.toSha256Base64url(turtle)

console.log(hash)
```

license:
  MIT
