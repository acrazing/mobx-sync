/*!
 *
 * Copyright 2018 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2018-01-06 12:23:01
 * @version 1.0.0
 * @desc ignore.ts
 */

import { Keywords } from './constants';

export function ignore(proto: any, key: string) {
  if (!proto.hasOwnProperty(Keywords.Ignores)) {
    Object.defineProperty(
      proto,
      Keywords.Ignores,
      { enumerable: false, value: Object.create(proto[Keywords.Ignores] || null) },
    );
    const { toJSON } = proto;
    proto.toJSON = function () {
      const data = toJSON ? toJSON.call(this) : this;
      if (!this[Keywords.Ignores]) {
        return data;
      }
      const dump: any = {};
      for (const key in data) {
        if (data.hasOwnProperty(key) && !this[Keywords.Ignores][key]) {
          dump[key] = data[key];
        }
      }
      return dump;
    };
  }
  proto[Keywords.Ignores][key] = true;
}