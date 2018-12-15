/*!
 * Copyright 2018 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2018-09-08 10:46:07
 */

import { observable } from 'mobx';
import { version } from '../../src';

/**
 * @desc the version control for a node, if the instance of the node
 * persisted is different, it will be ignored.
 */
@version(2)
export class UserStore {
  @observable id = 1;
  @observable name = '';
  @observable avatar = '';
}

export const user = new UserStore();
