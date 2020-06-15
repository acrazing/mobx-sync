/*!
 * Copyright 2018 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2018-09-08 10:46:07
 */

import { observable } from 'mobx';
import { date, ignore, version } from 'mobx-sync';
import { UserStore } from './user';

export class ArticleStore {
  @observable id = 0;
  @observable title = '';

  /**
   * @desc this field is not persisted, and its update event
   * will not trigger persist action.
   * @type {string}
   */
  @ignore
  @observable
  content = '';

  /**
   * @desc custom formatter: the date field should be persisted
   * as a string, and load as a Date instance
   *
   * @desc NOTE: all the field should contains a initial value,
   * or it will not trigger persist event when it changes, this
   * is caused by `JSON.stringify` will not access the undefined
   * fields.
   * @type {Date}
   */
  @date
  @observable
  createdAt: Date = new Date();

  /**
   * @desc version control, you can specify a version for a node
   * or a field, if the persisted data's version is different, it
   * will be ignored.
   * @type {UserStore}
   */
  @version(1)
  @observable
  author = new UserStore();
}

export const article = new ArticleStore();
