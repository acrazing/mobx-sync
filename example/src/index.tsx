/*!
 * Copyright 2018 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2018-09-08 10:46:07
 */

import localforage from 'localforage';
import { AsyncTrunk } from 'mobx-sync';
import * as React from 'react';
import { render } from 'react-dom';
import { App } from './App';
import { store } from './store';

/**
 * the initial state injected by SSR
 */
declare const __INITIAL_STATE__: any;

/**
 * @desc create an async trunk with custom options
 * @type {AsyncTrunk}
 */
const trunk = new AsyncTrunk(store, {
  /**
   * @desc custom storage: built in storage is supported
   *  - localStorage
   *  - sessionStorage
   *  - ReactNative.AsyncStorage
   */
  storage: localforage as any,
  /**
   * @desc custom storage key, the default is `__mobx_sync__`
   */
  storageKey: '__persist_mobx_stores__',
  /**
   * @desc the delay time, use for mobx reaction
   */
  delay: 1e3,
});

/**
 * @desc load persisted stores
 */
trunk.init(__INITIAL_STATE__).then(() => {
  /**
   * @desc do any staff with the loaded store,
   * and any changes now will be persisted
   * @type {boolean}
   */
  store.storeLoaded = true;
});

render(<App />, document.getElementById('root'));
