# mobx-sync

A library use JSON to persist your mobx stores with version control.

## Features

- use `JSON.stringify/JSON.parse` as the deserialize/serialize method
- version control by use `@version` decorator
- ignore any store node by use `@ignore` decorator
- support React Native
- support server side render (SSR)

## Install

```bash
# by yarn
yarn add mobx-sync

# OR by npm
npm i -S mobx-sync
```

## Quick Start

```typescript jsx
import { AsyncTrunk, date } from 'mobx-sync';
import { observable } from 'mobx';

class Store {
  @observable
  foo = 'bar';

  @date
  @observable
  date = new Date();
}

const store = new Store();

// create a mobx-sync instance, it will:
// 1. load your state from localStorage & ssr renderred state
// 2. persist your store to localStorage automatically
// NOTE: you do not need to call `trunk.updateStore` to persist
// your store, it is persisted automatically!
const trunk = new AsyncTrunk(store, { storage: localStorage });

// init the state and auto persist watcher(use mobx's autorun)
// NOTE: it will load the persisted state first(and must), and
// then load the state from ssr, if you pass it as the first
// argument of `init`, just like trunk.init(__INITIAL_STATE__)
trunk.init().then(() => {
  // you can do any staff now, just like:

  // 1. render app with inited state:
  ReactDOM.render(<App store={store} />);

  // 2. update store, the update of the store will be persisted
  // automatically:
  store.foo = 'foo bar';
});
```

## Full Example

You can see it at [example](example/index.tsx)

## API Reference

- [version control](#version-control)
- [ignore control](#ignore-control)
- [custom formatter](#custom-formatter)
- [async trunk](#async-trunk)
- [sync trunk](#sync-trunk)
- [ssr](#ssr)

### verson control

Sometimes, if your store's data structure is changed, which means
the persisted data is illegal to use, you can use `@version` decorator
to mark the store node's `version`, if the persisted data's version is
different with the declared node's verson, it will be ignored.

For example, we published an application like it in [Quick Start](#quick-start),
and then we want to change the type of `Store#foo` from `string` to `number`,
so, the persisted string value of `foo` is illegal, and should be ignored, and
then, we can use `@version` to mark the `foo` field to new version to omit it:

```typescript jsx
import { version } from 'mobx-sync';
import { observable } from 'mobx';

class Store {
  @version(1)
  @observable
  foo = 1;

  @date
  @observable
  date = new Date();
}

// ...
```

If you run the new verson of the application, it will omit the persisted
value of `foo`, and keep the value of `date`, so, after call `trunk.init()`,
the `foo` will be `1`, and `date` will be previous verson's value.

**NOTE: if the new verson is strictly different with the persisted version,
it will be ignored, or else it will be loaded as normal, so if you use it,
we recommend you use an progressive increasing integer to mark it, because
you couldn't know the version of persisted in client.**

`@version` supports decorate class also, that means if any instance of the
class will be ignored if its verson is different. For example:

```typescript jsx
import { version } from 'mobx-sync';
import { observable } from 'mobx';

@version(1)
class C1 {
  p1 = 1;
}

class C2 {
  p2 = 2;
}

class Store {
  c1 = new C1();
  c2 = new C2();
  c1_1 = new C1();
}
```

If the persisted version of store's `c1` && `c1_1` has different verson with
`1`, it will be ignored.

**NOTE: if you use a non-pure object as the store field, you must initialize it
before you call `trunk.init`, just like `custom store class`(`C1`, `C2` upon),
`observable.map`, `observable.array`, etc. And it must be iterable by `for..in`
grammar, if not, you may need to use a custom formatter(see
[custom formatter](#custom-formatter) bellow) to serialize/de-serialize it.**

Signature:

```typescript jsx
function version(id: number): PropertyDecorator & ClassDecorator;
```

### ignore control

If you hope some fields of your store is ignored to persist, just like the artile
with big size of detailed content. you can use `@ignore` decorator to mark it as
ignored, it will not be loaded (even if it is persisted in previous version) when
init, and its change will not trigger the persist action.

For example: if we want to skip the `date` field in Quick Start, we just need to
use `@ignore` to decorate it:

```typescript jsx
import { date, ignore } from 'mobx-sync';
import { observable } from 'mobx';

class Store {
  @observable
  foo = 'bar';

  @ignore
  @date
  @observable
  date = new Date();
}
```

`@ignore` only supports decorate property.

Signature:

```typescript jsx
/**
 * works in web environment only
 */
function ignore(target: any, key: string): void;
namespace ignore {
  /**
   * works in both web and ssr environment
   */
  function ssr(target: any, key: string): void;

  /**
   * works in ssr environment only
   */
  function ssrOnly(target: any, key: string): void;
}
```

### custom formatter

Sometimes, your store node is not pure ojbect, just like `Set`, `Map`,
`observable.map<number, Date>`, etc, you may need to use custom formatter
(`@format`) to parse/stringify the data/value.

For example, we use `Set<Date>` as a field:

```typescript jsx
import { format } from 'mobx-sync';
import { observable } from 'mobx';

class Store {
  @format(
    (data: string[]) => new Set(data.map((d) => new Date(d))),
    (value: Set<Date>) => Array.from(value, (v) => v.toISOString()),
  )
  allowDates = new Set<Date>();
}
```

Built-in formatters:

- `@date`: parse/stringify date
- `@regexp`: parse/stringify regexp

Signature:

```typescript jsx
/**
 * define a custom stringify/parse function for a field, it is useful for
 * builtin objects, just like Date, TypedArray, etc.
 *
 * @example
 *
 * // this example shows how to format a date to timestamp,
 * // and load it from serialized string,
 * // if the date is invalid, will not persist it.
 * class SomeStore {
 *   @format<Date, number>(
 *      (timestamp) => new Date(timestamp),
 *      (date) => date ? +date : void 0,
 *   )
 *   dateField = new Date()
 * }
 *
 * @param deserializer - the function to parse the serialized data to
 *      custom object, the first argument is the data serialized by
 *      `serializer`, and the second is the current value of the field.
 * @param serializer - the function to serialize the object to pure js
 *      object or any else could be stringify safely by `JSON.stringify`.
 */
function format<I, O = I>(
  deserializer: (persistedValue: O, currentValue: I) => I,
  serializer?: (value: I) => O,
): PropertyDecorator;

function date(target: any, key: string): void;

function regexp(target: any, key: string): void;
```

### SSR

Sometimes, we hope to use mobx in SSR(Server-Side Rendering), there is no
standard way to stringify/load mobx store to/from html template, mobx-sync
maybe one.

At first, you need to call `config({ ssr: true })` before call any decorator
of mobx-sync. And then, you can use `JSON.stringify` to stringify your state
to html template, and then use `trunk.init` or `parseStore` to load it to
your store.

For example:

```typescript jsx
// store.ts
import { ignore } from 'mobx-sync'
import { observable } from 'mobx'

export Store {
  @observable userId = 0

  @ignore.ssr
  users = observable.map()
}
```

```typescript jsx
// server.ts
import { config } from 'mobx-sync';

config({ ssr: true });

import { Store } from './store';

app.get('/', (_, res) => {
  const store = new Store();

  res.end(`<!DOCTYPE html>
  <html>
  <body>
  <div id=root>${renderToString(<App store={store} />)}</div>
  <script>var __INITIAL_STATE__ = ${JSON.stringify(store).replace(
    /</g,
    '\\u003c',
  )}</script>
  </body>
  </html>`);
});
```

```typescript jsx
// client.ts
import { AsyncTrunk } from 'mobx-sync';
import { Store } from './store';

const store = new Store();
const trunk = new AsyncTrunk(store);

trunk.init(__INITIAL_STATE__).then(() => {
  ReactDOM.render(<App store={store} />, document.querySelector('#root'));
});
```

**NOTE: if you do not want to use a trunk to persist/load state from
localStorage, just want to use mobx-sync to load SSR state, you can use
`parseStore(store, state, true)` to load it.**

For example:

```typescript jsx
// client.ts
import { parseStore } from 'mobx-sync';
import { Store } from './store';

const store = new Store();

parseStore(store, __INITIAL_STATE__, true);

ReactDOM.render(<App />, document.querySelector('#root'));
```

Signature:

```typescript jsx
interface Options {
  ssr: boolean;
}

function config(options: Partial<Options>): void;

function parseStore(store: any, data: any, isFromServer: boolean): void;
```

### async trunk

### sync trunk

Both of `AsyncTrunk` and `SyncTrunk` is the class to auto load/persist
store to storage, the difference between them is the `AsyncTrunk` runs
asynchronously and `SyncTrunk` runs synchronously.

Signature:

```typescript jsx
// this is a subset of `Storage`
interface SyncStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

// this is a subset of `ReactNative.AsyncStorage`
interface AsyncStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

/**
 * sync trunk initial options
 */
export interface SyncTrunkOptions {
  /**
   * storage, SyncStorage only
   * default is localStorage
   */
  storage?: SyncStorage;
  /**
   * the storage key, default is KeyDefaultKey
   */
  storageKey?: string;
  /**
   * the delay time, default is 0
   */
  delay?: number;

  /**
   * error callback
   * @param error
   */
  onError?: (error: any) => void;
}

/**
 * the async trunk initial options
 */
export interface AsyncTrunkOptions {
  /**
   * storage, both AsyncStorage and SyncStorage is supported,
   * default is localStorage
   */
  storage?: AsyncStorage | SyncStorage;
  /**
   * the custom persisted key in storage,
   * default is KeyDefaultKey
   */
  storageKey?: string;
  /**
   * delay milliseconds for run the reaction for mobx,
   * default is 0
   */
  delay?: number;

  /**
   * error callback
   * @param error
   */
  onError?: (error: any) => void;
}

class AsyncTrunk {
  disposer: () => void;
  constructor(store: any, options?: AsyncTrunkOptions);
  init(initialState?: any): Promise<void>;
  // call persist manually
  persist(): Promise<void>;
  // clear persisted state in storage
  clear(): Promise<void>;
  // change the store instance
  updateStore(): Promise<void>;
}

class SyncTrunk {
  disposer: () => void;
  constructor(store: any, options?: SyncTrunkOptions);
  init(initialState?: any): void;
  // call persist manually
  persist(): void;
  // clear persisted state in storage
  clear(): void;
  // change the store instance
  updateStore(): void;
}
```

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
