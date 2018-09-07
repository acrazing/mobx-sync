/*!
 * Copyright 2018 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2018-06-27 00:25:38
 */

import { __assign } from 'tslib';
import { inject } from './inject';
import { KeyFormat, KeyIgnores, KeyNodeVersion, KeyVersions } from './keys';

export function format<I, O = I> (
  deserializer: (persistedValue: O, currentValue: I) => I,
  serializer?: (value: I) => O,
): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    inject(target, KeyFormat);
    target[KeyFormat][propertyKey] = { deserializer, serializer };
  };
}

export const date = format<Date, string>((value) => new Date(value));

export interface RegExpStore {
  flags: string;
  source: string;
}

export const regexp = format<RegExp, RegExpStore>(
  (value) => new RegExp(value.source, value.flags),
  (value) => ({ flags: value.flags, source: value.source }),
);

export function ignore (target: any, propertyKey: string) {
  inject(target, KeyIgnores);
  target[KeyIgnores][propertyKey] = true;
}

export function version (value: number | string) {
  return (target: any, key: string = KeyNodeVersion) => {
    if (typeof target === 'function') {
      target = target.prototype;
    }
    inject(target);
    if (!target.hasOwnProperty(KeyVersions)) {
      target[KeyVersions] = __assign({}, target[KeyVersions] || {});
    }
    target[KeyVersions][key] = value;
  };
}
