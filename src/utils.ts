/*!
 * Copyright 2018 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2018-06-27 00:21:42
 */

export function isPrimitive(value: any) {
  if (value === void 0 || value === null) {
    return true;
  }
  const type = typeof value;
  return type === 'string' || type === 'number' || type === 'boolean';
}

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

// TODO support es5 browsers
export function parseCycle(
  input: object,
  map = new Map<object, string[]>(),
  prefix = '',
): [any, string[]][] {
  if (isPrimitive(input)) {
    return [];
  }
  if (!map.has(input)) {
    map.set(input, [prefix || '.']);
  }
  for (const item of Object.entries(input)) {
    if (isPrimitive(item[1]) || Object.keys(item[1]).length === 0) {
      continue;
    }
    const subPrefix = prefix + '.' + item[0];
    if (!map.has(item[1])) {
      map.set(item[1], [subPrefix]);
      parseCycle(item[1], map, subPrefix);
    }
    else {
      (map.get(item[1]) as string[]).push(subPrefix);
    }
  }
  if (prefix !== '') {
    return [];
  }
  const output: [any, string[]][] = [];
  map.forEach((value, key) => {
    if (value.length > 1) {
      output.push([key, value]);
    }
  });
  return output;
}
