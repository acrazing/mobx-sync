/*!
 *
 * Copyright 2018 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2018-01-06 17:12:54
 * @version 1.0.0
 * @desc to-json.ts
 */

export function toJSON(data: any, recursive = true) {
  if (recursive) {
    const str = JSON.stringify(data);
    if (str === void 0) {
      return void 0;
    }
    return JSON.parse(str);
  }
  if (!data || !('toJSON' in data)) {
    return data;
  }
  return data.toJSON();
}