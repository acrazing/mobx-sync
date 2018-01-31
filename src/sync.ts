/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-11-28 17:31:44
 * @version 1.0.0
 * @desc sync.ts
 */

import { autorun, autorunAsync, IReactionDisposer, runInAction } from 'mobx'
import { __KEY__, __NAME__, parseCycle, parseStore } from './utils'

export interface SyncTrunkOptions {
  storage?: Storage;
  storageKey?: string;
  sync?: boolean;
  delay?: number;
}

export class SyncTrunk {
  disposer: IReactionDisposer
  private store: any
  private storage: Storage
  private storageKey: string
  private sync: boolean
  private delay: number

  constructor(
    store: any,
    { storage = localStorage, storageKey = __KEY__, sync = false, delay = 0 }: SyncTrunkOptions = {},
  ) {
    this.store = store
    this.storage = storage
    this.storageKey = storageKey
    this.sync = sync
    this.delay = delay
  }

  persist() {
    try {
      this.storage.setItem(this.storageKey, JSON.stringify(this.store))
    } catch {
      // TODO report error
      console.error('cycle reference occured', parseCycle(this.store))
    }
  }

  init() {
    try {
      const data = this.storage.getItem(this.storageKey)
      if (data) {
        runInAction(() => {
          parseStore(this.store, JSON.parse(data))
        })
      }
    } catch {
      // DO nothing
    }
    // persist before listen change
    this.persist()
    if (this.sync) {
      this.disposer = autorun(__NAME__, this.persist.bind(this))
    } else {
      this.disposer = autorunAsync(__NAME__, this.persist.bind(this), this.delay)
    }
  }

  clear() {
    this.storage.removeItem(this.storageKey)
  }

  updateStore(store: any) {
    this.store = store
    this.persist()
  }
}
