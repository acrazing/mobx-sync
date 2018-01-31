/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-11-28 17:31:44
 * @version 1.0.0
 * @desc async.ts
 */

import { autorun, autorunAsync, IReactionDisposer, runInAction } from 'mobx'
import { __KEY__, __NAME__ } from './constants'
import { parseCycle } from './parse-cycle'
import { parseStore } from './parse-store'

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

export class AsyncTrunk {
  disposer: IReactionDisposer
  private store: any
  private storage: AsyncStorage | Storage
  private storageKey: string
  private sync: boolean
  private delay: number

  constructor(store: any, {
    storage = localStorage,
    storageKey = __KEY__,
    sync = false,
    delay = 0,
  }: AsyncTrunkOptions = {}) {
    this.store = store
    this.storage = storage
    this.storageKey = storageKey
    this.sync = sync
    this.delay = delay
  }

  async persist() {
    try {
      await this.storage.setItem(this.storageKey, JSON.stringify(this.store))
    } catch {
      // TODO report error
      console.error('cycle reference occurred', parseCycle(this.store))
    }
  }

  async init() {
    try {
      const data = await this.storage.getItem(this.storageKey)
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

  async clear() {
    return this.storage.removeItem(this.storageKey)
  }

  updateStore(store: any) {
    this.store = store
    return this.persist()
  }
}
