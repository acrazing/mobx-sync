# mobx-sync

A library to persist your mobx stores.

## Updates

- remove interface to implement it, use `@version` decorator
- `@version` decorator supports to decorating class directly, it means the version of the node it self, the `__version__` field is deprecated

## Features

- Use JSON as the serialize/unserialize method.
- Version control for each store node.
- Ignore any store node as you wanted.
- Support react native.

## Install

- var yarn: `yarn add mobx-sync`
- var npm: `npm install mobx --save`

## Change Log

### 0.1.0

- Add version control for a field: you can use `@version` decorator to specify the version of the field, if the version is different for a field, the stored value will be ignored, for example:
    ```typescript
    // In first version of your application, you created a node with one field `id`, and did not specify the version
    // of the field. Then persist it.
    class Node {
      id = 1
    }
  
    // In current version, you need to update the data structure of the field `id`, just like change the type from
    // `number` to `string`, and then you can add a version decorator for the field like follow:
    import { version } from './src/version'
    class NewNode {
      @version(1)
      id = '1'
    }
  
    // And then, the data persisted that `id=1` will be ignored, after load, the value of the `id` will be `'1'`
    ```
- Fix bugs about version controls.

## Full usage example

```typescript
import { action, observable } from 'mobx'
import { AsyncTrunk } from './src/async'
import { nonenumerable } from './src/utils'


// user store node class
class UserStore {
  // the version of the node, if different with the persisted version,
  // the persisted data of the node will be ignored
  __version__ = 1

  // the observable primative field
  @observable id = 0
  // obervable list
  @observable list = observable.array<number>()
  // observable map
  @observable map = observable.map<number>()

  // observable and IGNORED for persist
  // a @nonenumerable decorated field will not be persisted
  // by JSON.stringify
  @nonenumerable @observable extra = 'extra'

  // action(function) will not be persisted
  @action
  add() {
    this.id++
  }

  @action
  push() {
    this.list.push(++this.id)
  }

  @action
  set() {
    this.map.set(++this.id + '', this.id)
  }
}

// user store instance
const User = new UserStore()

// any other store node class
class IgnoredStore {
  __version__ = 1
  @observable id = 1

  @action
  add() {
    this.id++
  }
}

// ignored store node instance
const Ignored = new IgnoredStore()

// root store class, use class to use decorator
class RootStore {
  // the root node version, if the field changed
  // all the child nodes or fields on this node
  // will be ignored, if it is root, means all
  // the data will be ignored.
  __version__ = 1
  
  // user node
  user = User
  
  // ignored node, this node will never be
  // persisted
  @nonenumerable ignore = Ignored
}

const store = new RootStore()

const trunk = new AsyncTrunk(store, {})

trunk.init().then(() => {
  // do any stuff at here, changed the data in `store`
  // will be persist, asynchronously.
  // default delay is in nextTick
})
```

## API

### Asynchronous persist

This is the main class to persist data.

```typescript
import { IReactionDisposer } from 'mobx';

export interface AsyncStorage {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
}

export interface AsyncTrunkOptions {
    storage?: AsyncStorage | Storage;
    storageKey?: string;
    sync?: boolean;
    delay?: number;
}

export declare class AsyncTrunk {
    disposer: IReactionDisposer;
    constructor(store: any, options?: AsyncTrunkOptions);
    persist(): Promise<void>;
    init(): Promise<void>;
    clear(): Promise<void>;
    updateStore(store: any): Promise<void>;
}
```

### Synchronous persist

This is use for persist data synchronously. This requires the storage API is synchronous.

```typescript
import { IReactionDisposer } from 'mobx';

export interface SyncTrunkOptions {
    storage?: Storage;
    storageKey?: string;
    sync?: boolean;
    delay?: number;
}

export declare class SyncTrunk {
    disposer: IReactionDisposer;
    constructor(store: any, options?: SyncTrunkOptions);
    persist(): void;
    init(): void;
    clear(): void;
    updateStore(store: any): void;
}
```

### Options

Both `SyncTrunk` and `AsyncTrunk` need the following optional options:

```typescript
import { AsyncStorage } from './src/async'
export interface AsyncTrunkOptions {
    // A storage instance, you can use localStorage, sessionStorage, or AsyncStorage(React Native)
    // or any else you wanted.
    storage?: AsyncStorage | Storage;
    // the key of the storage, if changed, the old data will not be cleared
    storageKey?: string;
    // for mobx autorun sync or async, default is async
    sync?: boolean;
    // if autorun is async, the delay time to run, default is 0
    delay?: number;
}
```

## License

[MIT](./LICENSE)
