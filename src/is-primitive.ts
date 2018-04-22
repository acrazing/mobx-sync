/*!
 *
 * Copyright 2018 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2018-01-06 12:23:39
 * @version 1.0.0
 * @desc is-primitive.ts
 */

export function isPrimitive(value: any) {
  if (value === void 0 || value === null) {
    return true;
  }
  const type = typeof value;
  return type === 'string' || type === 'number' || type === 'boolean';
}
