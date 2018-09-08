# mobx-sync

A library use JSON to persist your mobx stores with version control.

## Features

- use `JSON.stringify/JSON.parse` as the deserialize/serialize method
- version control by use `@version` decorator
- ignore any store node by use `@ignore` decorator
- support React Native

## Install

```bash
# by yarn
yarn add mobx-sync

# OR by npm
npm i -S mobx-sync
```

## Quick Start

```typescript jsx
import { AsyncTrunk } from 'mobx-sync'
import { observable } from 'mobx'

// create a mobx store object in any form
const store = observable({ foo: 'bar' });

// create a mobx-sync
const trunk = new AsyncTrunk(store);

// load the persisted data to store
trunk.init().then(() => {
  // do any staff with loaded store
  console.log(store.foo);
})
```

## Full Example

You can see it at [example](example/index.tsx)

## API Reference

- [version control](#version-control)
- [ignore control](#ignore-control)
- [custom formatter](#custom-formatter)
- [async trunk](#async-trunk)
- [sync trunk](#sync-trunk)

TODO T_T

## License

```
The MIT License (MIT)

Copyright (c) 2016 acrazing

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
