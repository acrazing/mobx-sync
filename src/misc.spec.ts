/*!
 *
 * Copyright 2018 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2018-01-06 17:12:54
 * @version 1.0.0
 * @desc misc.spec.ts
 */

export function toJSON(data: any) {
  if (!data || !('toJSON' in data)) {
    return data
  }
  return data.toJSON()
}