/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-11-28 17:31:44
 * @version 1.0.0
 * @desc async.ts
 */

import { autorun, IReactionDisposer, runInAction } from 'mobx'
import { Keywords } from './constants'
import { parseCycle } from './parse-cycle'
import { parseStore } from './parse-store'
import { SyncStorage } from './sync'

export interface AsyncStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface AsyncTrunkOptions {
  storage?: AsyncStorage | SyncStorage;
  storageKey?: string;
  delay?: number;
}

export class AsyncTrunk {
  disposer: IReactionDisposer
  private store: any
  private storage: AsyncStorage | SyncStorage
  private storageKey: string
  private delay: number

  constructor(store: any, {
    storage = localStorage,
    storageKey = Keywords.DefaultKey,
    delay = 0,
  }: AsyncTrunkOptions = {}) {
    this.store = store
    this.storage = storage
    this.storageKey = storageKey
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
    this.disposer = autorun(this.persist.bind(this), { name: Keywords.ActionName, delay: this.delay })
  }

  async clear() {
    return this.storage.removeItem(this.storageKey)
  }

  updateStore(store: any) {
    this.store = store
    return this.persist()
  }
}
