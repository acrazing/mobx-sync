/*!
 *
 * Copyright 2018 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2018-02-04 17:27:30
 * @version 1.0.0
 * @desc memory-storage.ts
 */

import { SMap } from 'monofile-utilities/lib/map';
import { SyncStorage } from './sync';

export class MemoryStorage implements SyncStorage {
  private data: SMap<string> = {};

  constructor(public debug = false) {
  }

  getItem(key: string) {
    this.debug && console.log('storage.get %s: %s', key, this.data[key]);
    return this.data.hasOwnProperty(key) ? this.data[key] : null;
  }

  removeItem(key: string) {
    this.debug && console.log('storage.remove %s', key);
    delete this.data[key];
  }

  setItem(key: string, value: string) {
    this.debug && console.log('storage.set %s: %s', key, value);
    this.data[key] = value + '';
  }
}