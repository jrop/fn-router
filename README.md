# fn-router

[![Greenkeeper badge](https://badges.greenkeeper.io/jrop/fn-router.svg)](https://greenkeeper.io/)

> Route URLs to functions

[![Build Status](https://travis-ci.org/jrop/fn-router.svg?branch=master)](https://travis-ci.org/jrop/fn-router)

## Installation

```sh
npm install --save fn-router
```

## Use

```js
'use strict'
const router = require('fn-router')

const r = router()
.add('/api/v:version', router()
	.add('/', () => 'API Index')
	.add('/version', params => params.version))
.add('/say-hello/:name', params => `Hello ${params.name}!`)

r('/say-hello/NodeJS')
// => 'Hello NodeJS!'

r('/api/v1')
// => 'API Index'

r('/api/v3/version')
// => '3'
```

For more usage examples, see `test.js`.

## License

Copyright (c) 2016, Jonathan Apodaca <jrapodaca@gmail.com>

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
