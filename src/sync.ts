/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-11-28 17:31:44
 * @version 1.0.0
 * @desc sync.ts
 */

import { autorun, IReactionDisposer, runInAction } from 'mobx';
import { Keywords } from './constants';
import { parseCycle } from './parse-cycle';
import { parseStore } from './parse-store';

export interface SyncTrunkOptions {
  storage?: Storage;
  storageKey?: string;
  delay?: number;
}

export interface SyncStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export class SyncTrunk {
  disposer: IReactionDisposer;
  private store: any;
  private storage: SyncStorage;
  private storageKey: string;
  private delay: number;

  constructor(
    store: any,
    { storage = localStorage, storageKey = Keywords.DefaultKey, delay = 0 }: SyncTrunkOptions = {},
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

  init() {
    try {
      const data = this.storage.getItem(this.storageKey);
      if (data) {
        runInAction(() => {
          parseStore(this.store, JSON.parse(data));
        });
      }
    } catch {
      // DO nothing
    }
    // persist before listen change
    this.persist();
    this.disposer = autorun(this.persist.bind(this), { name: Keywords.ActionName, delay: this.delay });
  }

  clear() {
    this.storage.removeItem(this.storageKey);
  }

  updateStore(store: any) {
    this.store = store;
    this.persist();
  }
}
