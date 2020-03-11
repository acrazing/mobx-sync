/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-11-28 17:31:44
 * @version 1.0.0
 * @desc sync.ts
 */

import { autorun, IReactionDisposer, toJS } from 'mobx';
import { noop } from 'monofile-utilities/lib/consts';
import { KeyActionName, KeyDefaultKey } from './keys';
import { parseStore } from './parse-store';

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

  /**
   * error callback
   * @param error
   */
  onError?: (error: any) => void;
}

export class SyncTrunk {
  disposer!: IReactionDisposer;
  private store: any;
  private storage: SyncStorage;
  readonly storageKey: string;
  readonly delay: number;
  readonly onError: (error: any) => void;

  constructor(
    store: any,
    {
      storage = localStorage,
      storageKey = KeyDefaultKey,
      delay = 0,
      onError = noop,
    }: SyncTrunkOptions = {},
  ) {
    this.store = store;
    this.storage = storage;
    this.storageKey = storageKey;
    this.delay = delay;
    this.onError = onError;
  }

  persist() {
    try {
      this.storage.setItem(this.storageKey, JSON.stringify(toJS(this.store)));
    } catch (error) {
      this.onError(error);
    }
  }

  /**
   * init the store
   */
  init(initialState?: any) {
    try {
      const data = this.storage.getItem(this.storageKey);
      if (data) {
        parseStore(this.store, JSON.parse(data), false);
      }
    } catch {
      // DO nothing
    }
    if (initialState) {
      parseStore(this.store, initialState, true);
    }
    // persist before listen change
    this.persist();
    this.disposer = autorun(this.persist.bind(this), {
      name: KeyActionName,
      delay: this.delay,
      onError: this.onError,
    });
  }

  clear() {
    this.storage.removeItem(this.storageKey);
  }

  updateStore(store: any) {
    this.store = store;
    this.persist();
  }
}
