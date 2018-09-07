/*!
 * Copyright 2018 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2018-09-08 11:08:05
 */

import { ignore } from '../../src';
import { article } from './article';
import { user } from './user';

export class RootStore {
  /**
   * @desc ignore node, this node will not be persisted, and its changes
   * will not trigger persist event.
   * @type {boolean}
   */
  @ignore storeLoaded = false;
  article = article;
  user = user;
}

export const store = new RootStore();
