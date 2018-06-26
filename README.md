# mobx-sync

A library to persist your mobx stores.

## Features

- Native JSON as the (de-)serialize protocol
- Version control
- Ignore control
- React Native support

## Install

- var yarn: `yarn add mobx-sync`
- var npm: `npm install mobx --save`

## Change Log

### 0.6.0

- add `@format` decorator to convert persisted data to specified data struct, for example, you can persist/load a `Date` field as follow:
    ```typescript
    import { format, date, regexp } from './src/decorators'
    class Node {
      // use the decorator directly
      @format((value) => new Date(value)) date = new Date();
    
      // alt, you can use date/regexp decorator for date/regexp directly
      @date date2 = new Date();
      @regexp regexp = /abc/igum;
    }
    ```

### 0.5.0

- fix `@ignore` decorator with `mobx@4.x`, for [some implicit reason](https://github.com/mobxjs/mobx/issues/1493#issuecomment-381836531), please note that the current version of `@ignore` performance maybe down.

### 0.4.0

- fix issues for dependencies

### 0.3.0

- update the version of mobx to 4.x
- recover the index entry for js users

### 0.2.0

- remove interface to implement it, use `@version` decorator
- `@version` decorator supports to decorating class directly, it means the version of the node it self, the `__version__` field is deprecated

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
import { version, AsyncTrunk, ignore } from './src'
import { observable } from 'mobx'

// define a store node with some thing
// version control for node, if the version of persisted
// data about this node is different to current version,
// it will not be loaded.
@version(1)
class UserStore {
  // normal store field
  @observable name = 'user';
  
  // map
  @observable map = observable.map<string, string>();
  
  // array
  @observable array = observable.array<string, string>();
  
  // some other user defined model
  @observable model = new NestedNode();
  
  // version control for field, the function is same to
  // class decorator
  // please note that the `@observable` decorator must placed
  // at the end of the decorators
  @version(2) @observable foo = 'bar';
  
  // ignore a field, this field will not be persisted, nor
  // loaded from persisted data, which means even if the
  // previous version of data persisted contains this field,
  // will still not be loaded.
  @ignore @observable ignored = 'ignored';
}

// define another store node
class NestedNode {
  @observable foo = 'bar';
}

// init global store
const store = { user: new UserStore() };

// create a persist actor
const trunk = new AsyncTrunk(store, { storage: localStorage });

// load persisted data to store, and auto persist store
// if it changed.
trunk.init().then(() => {
  // do any staff as you wanted with loaded store
  console.log(store.user.model.foo);
});
```

## API Reference

### Storage interface

```typescript
// just localStorage or sessionStorage
export interface SyncStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

// React Native AsyncStorage
export interface AsyncStorage {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
}
```

### Asynchronous persist

This is the main class to persist data.

```typescript
import { IReactionDisposer } from 'mobx';
import { AsyncStorage, SyncStorage } from './src'

export interface AsyncTrunkOptions {
    // for async trunk, you can use async storage or sync storage
    // working with ReactNative.AsyncStorage
    storage?: AsyncStorage | SyncStorage;
    // the key for storage
    storageKey?: string;
    // autorun delay time, if not set, it will be synchronous
    // see the document about `mobx@autorun`
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
import { SyncStorage } from './src'

export interface SyncTrunkOptions {
    // for sync trunk, you can just use SyncStorage, just like sessionStorage or localStorage
    storage?: SyncStorage;
    storageKey?: string;
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

## License

[MIT](./LICENSE)
