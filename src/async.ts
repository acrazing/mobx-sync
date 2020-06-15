/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-11-28 17:31:44
 * @version 1.0.0
 * @desc async.ts
 */

import { autorun, IReactionDisposer } from 'mobx';
import { noop } from 'monofile-utilities/lib/consts';
import { KeyActionName, KeyDefaultKey } from './keys';
import { parseStore } from './parse-store';
import { SyncStorage } from './sync';

/**
 * The async storage API
 */
export interface AsyncStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
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

export class AsyncTrunk {
  disposer!: IReactionDisposer;
  private store: any;
  private storage: AsyncStorage | SyncStorage;
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
    }: AsyncTrunkOptions = {},
  ) {
    this.store = store;
    this.storage = storage;
    this.storageKey = storageKey;
    this.delay = delay;
    this.onError = onError;
  }

  async persist() {
    try {
      await this.storage.setItem(this.storageKey, JSON.stringify(this.store));
    } catch (reason) {
      this.onError(reason);
    }
  }

  /**
   * init the trunk async
   */
  async init(initialState?: any) {
    try {
      const data = await this.storage.getItem(this.storageKey);
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

  async clear() {
    return this.storage.removeItem(this.storageKey);
  }

  updateStore(store: any) {
    this.store = store;
    return this.persist();
  }
}
