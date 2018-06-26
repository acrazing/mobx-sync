/*!
 * Copyright 2018 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2018-06-27 00:25:58
 */

import { Keys } from './keys';

export function inject(target: any, key?: Keys) {
  if (key !== void 0 && !target.hasOwnProperty(key)) {
    Object.defineProperty(target, key, {
      enumerable: false, value: Object.create(target[key] || null),
    });
  }
  if (target.hasOwnProperty(Keys.Inject)) {
    return;
  }
  Object.defineProperty(target, Keys.Inject, {
    value: true,
    configurable: false,
    enumerable: false,
  });
  const { toJSON } = target;
  target.toJSON = function () {
    let data: any = toJSON ? toJSON.call(this) || {} : this;
    if (this[Keys.Format]) {
      const dump: any = {};
      for (const key in data) {
        if (data.hasOwnProperty(key)
          && this[Keys.Format][key]
          && this[Keys.Format][key].serializer) {
          dump[key] = this[Keys.Format][key].serializer(data[key]);
        }
        else {
          dump[key] = data[key];
        }
      }
      data = dump;
    }

    if (this[Keys.Ignores]) {
      const dump: any = {};
      for (const key in data) {
        if (data.hasOwnProperty(key) && !this[Keys.Ignores][key]) {
          dump[key] = data[key];
        }
      }
      data = dump;
    }
    data[Keys.Versions] = target[Keys.Versions];
    return data;
  };
}