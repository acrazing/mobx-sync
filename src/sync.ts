/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-11-28 17:31:44
 * @version 1.0.0
 * @desc sync.ts
 */

import { autorun, IReactionDisposer } from 'mobx';
import { KeyActionName, KeyDefaultKey } from './keys';
import { parseStore } from './parse-store';
import { parseCycle } from './utils';

export interface SyncStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
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
}

export class SyncTrunk {
  disposer!: IReactionDisposer;
  private store: any;
  private storage: SyncStorage;
  private storageKey: string;
  private delay: number;

  constructor(
    store: any,
    { storage = localStorage, storageKey = KeyDefaultKey, delay = 0 }: SyncTrunkOptions = {},
  ) {
    this.store = store;
    this.storage = storage;
    this.storageKey = storageKey;
    this.delay = delay;
  }

  persist() {
    try {
      this.storage.setItem(this.storageKey, JSON.stringify(this.store));
    } catch {
      // TODO report error
      console.error('cycle reference occurred', parseCycle(this.store));
    }
  }

  /**
   * init the store
   */
  init(initialStore?: any) {
    try {
      const data = this.storage.getItem(this.storageKey);
      if (data) {
        parseStore(this.store, JSON.parse(data), false);
      }
    } catch {
      // DO nothing
    }
    if (initialStore) {
      parseStore(this.store, initialStore, true);
    }
    // persist before listen change
    this.persist();
    this.disposer = autorun(
      this.persist.bind(this),
      { name: KeyActionName, delay: this.delay },
    );
  }

  clear() {
    this.storage.removeItem(this.storageKey);
  }

  updateStore(store: any) {
    this.store = store;
    this.persist();
  }
}
