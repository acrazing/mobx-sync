/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-11-28 18:39:59
 * @version 1.0.0
 * @desc example.ts
 */

import { sleep } from 'known-types/lib/sleep'
import { action, observable } from 'mobx'
import { AsyncStorage, AsyncTrunk } from './async'
import { nonenumerable } from './utils'

const data: any = {}

export const storage: AsyncStorage = {
  setItem(key: string, value: string) {
    data[key] = value
    console.log('setting %s:%s', key, value)
    return Promise.resolve()
  },
  getItem(key: string) {
    const value = data[key]
    console.log('getting: %s:%s', key, value)
    return Promise.resolve(typeof value === 'string' ? value : null)
  },
  removeItem(key: string) {
    data[key] = void 0
    return Promise.resolve()
  },
}

class UserStore {
  __version__ = 1

  @observable id = 0
  @observable list = observable.array<number>()
  @observable map = observable.map<number>()

  @nonenumerable @observable extra = 'extra'

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

const User = new UserStore()

class IgnoredStore {
  __version__ = 1
  @observable id = 1

  @action
  add() {
    this.id++
  }
}

const Ignored = new IgnoredStore()

class RootStore {
  __version__ = 1
  user = User
  @nonenumerable ignore = Ignored
}

const store = new RootStore()

const trunk1 = new AsyncTrunk(store, { storage, delay: 1 })

/*
 first started: {"__version__":1,"user":{"__version__":1,"id":0,"list":[],"map":{}}}
 getting: __STORAGE__:undefined
 setting __STORAGE__:{"__version__":1,"user":{"__version__":1,"id":0,"list":[],"map":{}}}
 first inited: {"__version__":1,"user":{"__version__":1,"id":0,"list":[],"map":{}}}
 setting __STORAGE__:{"__version__":1,"user":{"__version__":1,"id":1,"list":[],"map":{}}}
 setting __STORAGE__:{"__version__":1,"user":{"__version__":1,"id":2,"list":[2],"map":{}}}
 setting __STORAGE__:{"__version__":1,"user":{"__version__":1,"id":3,"list":[2],"map":{"3":3}}}
 first finished: {"__version__":1,"user":{"__version__":1,"id":4,"list":[2],"map":{"3":3}}}
 second started: {"__version__":1,"user":{"__version__":1,"id":5,"list":[2],"map":{"3":3}}}
 getting: __STORAGE__:{"__version__":1,"user":{"__version__":1,"id":3,"list":[2],"map":{"3":3}}}
 setting __STORAGE__:{"__version__":1,"user":{"__version__":1,"id":3,"list":[2],"map":{"3":3}}}
 second inited: {"__version__":1,"user":{"__version__":1,"id":3,"list":[2],"map":{"3":3}}}
 third started: {"__version__":1,"user":{"__version__":2,"id":0,"list":[],"map":{}}}
 getting: __STORAGE__:{"__version__":1,"user":{"__version__":1,"id":3,"list":[2],"map":{"3":3}}}
 setting __STORAGE__:{"__version__":1,"user":{"__version__":1,"id":3,"list":[2],"map":{"3":3}}}
 third inited: {"__version__":1,"user":{"__version__":1,"id":3,"list":[2],"map":{"3":3}}}
 forth started: {"__version__":2,"user":{"__version__":1,"id":3,"list":[2],"map":{"3":3}}}
 getting: __STORAGE__:{"__version__":1,"user":{"__version__":1,"id":3,"list":[2],"map":{"3":3}}}
 setting __STORAGE__:{"__version__":1,"user":{"__version__":1,"id":3,"list":[2],"map":{"3":3}}}
 forth inited: {"__version__":1,"user":{"__version__":1,"id":3,"list":[2],"map":{"3":3}}}
 */
console.log('first started: %s', JSON.stringify(store))
trunk1.init().then(async () => {
  console.log('first inited: %s', JSON.stringify(store))
  User.add() // primitive
  await sleep(3)
  User.push() // array
  await sleep(3)
  User.set() // map
  await sleep(3)
  Ignored.add() // ignored
  await sleep(3)
  trunk1.disposer()
  User.add() //disposed
  await sleep(3)
  console.log('first finished: %s', JSON.stringify(store))
}).catch((error) => {
  console.error('first error', error)
}).then(async () => {
  store.user.add()
  const trunk2 = new AsyncTrunk(store, { storage, delay: 1 })
  console.log('second started: %s', JSON.stringify(store))
  await trunk2.init()
  trunk2.disposer()
}).then(() => {
  console.log('second inited: %s', JSON.stringify(store))
}).catch((error) => {
  console.error('second error', error)
}).then(async () => {
  const User = new UserStore()
  User.__version__ = 2
  store.user = User
  const trunk3 = new AsyncTrunk(store, { storage, delay: 1 })
  console.log('third started: %s', JSON.stringify(store))
  await trunk3.init()
  console.log('third inited: %s', JSON.stringify(store))
  trunk3.disposer()
}).catch((error) => {
  console.error('third error', error)
}).then(async () => {
  const store3 = new RootStore()
  store3.__version__ = 2
  const trunk4 = new AsyncTrunk(store3, { storage, delay: 1 })
  console.log('forth started: %s', JSON.stringify(store3))
  await trunk4.init()
  trunk4.disposer()
  console.log('forth inited: %s', JSON.stringify(store3))
}).catch((error) => {
  console.error('forth error', error)
})
