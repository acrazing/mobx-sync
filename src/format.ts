/*!
 *
 * Copyright 2018 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2018-05-11 21:09:24
 * @version 1.0.0
 * @desc unmarshal.ts
 */

import { Keywords } from './constants';

export function format<I, O = I>(
  deserializer: (persistedValue: O, currentValue: I) => I,
  serializer?: (value: I) => O,
): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (!target.hasOwnProperty(Keywords.Format)) {
      Object.defineProperty(target, Keywords.Format, {
        enumerable: false,
        value: Object.create(target[Keywords.Format] || null),
      });
      const { toJSON } = target;
      target.toJSON = function () {
        const data = toJSON ? toJSON.call(this) : this;
        if (!this[Keywords.Format]) {
          return data;
        }
        const dump: any = {};
        for (const key in data) {
          if (data.hasOwnProperty(key)
            && this[Keywords.Format][key]
            && this[Keywords.Format][key].serializer) {
            dump[key] = this[Keywords.Format][key].serializer(data[key]);
          }
          else {
            dump[key] = data[key];
          }
        }
        return dump;
      };
    }
    target[Keywords.Format][propertyKey] = { deserializer, serializer };
  };
}

export const date = format<Date, string>((value) => new Date(value));

export const regexp = format<RegExp, { flags: string, source: string }>(
  (value) => new RegExp(value.source, value.flags),
  (value) => ({ flags: value.flags, source: value.source }),
);