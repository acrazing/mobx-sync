/*!
 *
 * Copyright 2018 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2018-01-06 12:23:01
 * @version 1.0.0
 * @desc parse-cycle.ts
 */

// TODO support es5 browsers
export function parseCycle(input: object, map = new Map<object, string[]>(), prefix = '') {
  if (!map.has(input)) {
    map.set(input, [prefix || '.'])
  }
  for (const item of Object.entries(input)) {
    if (!item[1] || Object.keys(item[1]).length === 0) {
      continue
    }
    const subPrefix = prefix + '.' + item[0]
    if (!map.has(item[1])) {
      map.set(item[1], [subPrefix])
      parseCycle(item[1], map, subPrefix)
    } else {
      (map.get(item[1]) as string[]).push(subPrefix)
    }
  }
  if (prefix !== '') {
    return
  }
  const output: [any, string[]][] = []
  map.forEach((value, key) => {
    if (value.length > 1) {
      output.push([key, value])
    }
  })
  return output
}
