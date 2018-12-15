/*!
 * Copyright 2018 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2018-06-27 00:25:38
 */

import { __assign } from 'tslib';
import { options } from './config';
import { inject } from './inject';
import { KeyFormat, KeyIgnores, KeyNodeVersion, KeyVersions } from './keys';

/**
 * define a custom stringify/parse function for a field, it is useful for
 * builtin objects, just like Date, TypedArray, etc.
 *
 * @example
 *
 * // this example shows how to format a date to timestamp,
 * // and load it from serialized string,
 * // if the date is invalid, will not persist it.
 * class SomeStore {
 *   @format<Date, number>(
 *      (timestamp) => new Date(timestamp),
 *      (date) => date ? +date : void 0,
 *   )
 *   dateField = new Date()
 * }
 *
 * @param deserializer - the function to parse the serialized data to
 *      custom object, the first argument is the data serialized by
 *      `serializer`, and the second is the current value of the field.
 * @param serializer - the function to serialize the object to pure js
 *      object or any else could be stringify safely by `JSON.stringify`.
 */
export function format<I, O = I>(
  deserializer: (persistedValue: O, currentValue: I) => I,
  serializer?: (value: I) => O,
): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    inject(target, KeyFormat);
    target[KeyFormat][propertyKey] = { deserializer, serializer };
  };
}

/**
 * The short hand for format date to ISO string
 *
 * @example
 *
 * class FooStore {
 *   @date
 *   dateField = new Date()
 * }
 */
export const date = format<Date, string>((value) => new Date(value));

export interface RegExpStore {
  flags: string;
  source: string;
}

/**
 * the short hand for format RegExp
 */
export const regexp = format<RegExp, RegExpStore>(
  (value) => new RegExp(value.source, value.flags),
  (value) => ({ flags: value.flags, source: value.source }),
);

function _ignore(target: any, propertyKey: string) {
  inject(target, KeyIgnores);
  target[KeyIgnores][propertyKey] = true;
}

/**
 * ignore the field, which means: if serialize the current store, it will
 * be omitted, and if the previous version does not omit it, will also
 * be omitted when call `parseStore`.
 *
 * Note: if set current runtime as ssr, will do nothing.
 *
 * @example
 *
 * class FooStore {
 *   @ignore
 *   bigTable = observable.map()
 * }
 *
 * @param target
 * @param propertyKey
 */
export function ignore(target: any, propertyKey: string) {
  if (options.ssr) {
    return;
  }
  _ignore(target, propertyKey);
}

/**
 * same to `ignore`, but ignore the field even if the runtime is ssr.
 */
ignore.ssr = _ignore;

/**
 * set the version of the field, if the persisted data's version does not
 * equal to the current version, it will be omitted.
 *
 * @example
 *
 * class FooStore {
 *   // this means the current version of users struct is 1, if
 *   // your users's struct updated with breaking changes, you may need
 *   // to update the 1 to 2 to avoid loading the previous version's
 *   // users from localStorage.
 *   @version(1)
 *   users = observable.map()
 * }
 *
 * @param value - the version number, this should be different from all the
 *    old version when update it, a best practice is use q increment number.
 */
export function version(value: number | string) {
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
