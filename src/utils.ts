/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-11-28 17:31:44
 * @version 1.0.0
 * @desc utils.ts
 */

import { isObservableArray, isObservableMap, observable } from 'mobx'

export function isPrimitive(value: any) {
  if (value === void 0 || value === null) {
    return true
  }
  const type = typeof value
  return type === 'string' || type === 'number' || type === 'boolean'
}

export const __VERSION__ = '__version__'
export const __KEY__ = '__STORAGE__'
export const __NAME__ = '__PERSIST__'

export function parseStore(store: any, data: any) {
  if ((__VERSION__ in store) || (__VERSION__ in data)) {
    if (store.version !== data.version) {
      return
    }
  }
  for (let key in data) {
    // use data to iterate for avoid store does not set default value, and then the
    // properties will not exist actually.
    // so, the observable map/array/object field must has a default value, when the
    // object is constructed.
    if (data.hasOwnProperty(key)) {
      const storeValue = store[key]
      const dataValue = data[key]
      if (isObservableArray(storeValue)) {
        store[key] = observable.array(dataValue)
      } else if (isObservableMap(storeValue)) {
        store[key] = observable.map(dataValue)
      } else if (isPrimitive(dataValue)) {
        // this means a primitive object just like Date, RegExp, etc. will be
        // covert to string when use JSON.stringify, maybe need a decorator to
        // hook the setter to covert it to target format.
        store[key] = dataValue
      } else {
        parseStore(storeValue, dataValue)
      }
    }
  }
}

export function nonenumerable(p: any, key: string, desc?: PropertyDescriptor): any {
  desc = desc || Object.getOwnPropertyDescriptor(p, key)
  let pValue: any
  if (desc) {
    desc.enumerable = false
    const { get, set } = desc
    pValue = desc.value
    desc.set = function (value) {
      set && set.call(this, value)
      if (this === p) {
        pValue = value
        return
      }
      const instDesc = Object.getOwnPropertyDescriptor(this, key)
      if (instDesc) {
        instDesc.enumerable = false
        Object.defineProperty(this, key, instDesc)
      } else {
        Object.defineProperty(this, key, {
          configurable: true,
          enumerable: false,
          writable: true,
          value: value,
        })
      }
    }
    desc.get = function () {
      return get ? get.call(this) : pValue
    }
    return desc
  }
  return {
    enumerable: false,
    configurable: true,
    set(value: any) {
      if (this === p) {
        pValue = value
        return
      }
      Object.defineProperty(this, key, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: value,
      })
    },
    get() {
      return pValue
    },
  }
}

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
