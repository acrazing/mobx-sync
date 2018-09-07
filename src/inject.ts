/*!
 * Copyright 2018 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2018-06-27 00:25:58
 */

import { KeyFormat, KeyIgnores, KeyInject, KeyVersions } from './keys';

export function inject (target: any, key?: string) {
  if (key !== void 0 && !target.hasOwnProperty(key)) {
    Object.defineProperty(target, key, {
      enumerable: false, value: Object.create(target[key] || null),
    });
  }
  if (target.hasOwnProperty(KeyInject)) {
    return;
  }
  Object.defineProperty(target, KeyInject, {
    value: true,
    configurable: false,
    enumerable: false,
  });
  const { toJSON } = target;
  target.toJSON = function () {
    let data: any = toJSON ? toJSON.call(this) || {} : this;
    if (this[KeyFormat]) {
      const dump: any = {};
      for (const key in data) {
        if (data.hasOwnProperty(key)
          && this[KeyFormat][key]
          && this[KeyFormat][key].serializer) {
          dump[key] = this[KeyFormat][key].serializer(data[key]);
        }
        else {
          dump[key] = data[key];
        }
      }
      data = dump;
    }

    if (this[KeyIgnores]) {
      const dump: any = {};
      for (const key in data) {
        if (data.hasOwnProperty(key) && !this[KeyIgnores][key]) {
          dump[key] = data[key];
        }
      }
      data = dump;
    }
    data[KeyVersions] = target[KeyVersions];
    return data;
  };
}
