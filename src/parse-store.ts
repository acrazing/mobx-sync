/*!
 *
 * Copyright 2018 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2018-01-06 12:24:06
 * @version 1.0.0
 * @desc parse-store.ts
 */

import { action, isObservableArray, isObservableMap, observable } from 'mobx'
import { __VERSION__, __VERSIONS__ } from './constants'
import { isPrimitive } from './is-primitive'

let parseStore = (store: any, data: any) => {
  // if store or data is empty, break it
  if (!store || !data) {
    return
  }
  // version control for node
  if ((__VERSION__ in store) || (__VERSION__ in data)) {
    if (store[__VERSION__] !== data[__VERSION__]) {
      return
    }
  }
  const dataVersions = data[__VERSIONS__] || {}
  const storeVersions = store[__VERSIONS__] || {}
  // use data to iterate for avoid store does not set default value, and then the
  // properties will not exist actually.
  // so, the observable map/array/object field must has a default value, when the
  // object is constructed.
  for (let key in data) {
    // skip internal fields
    if (key === __VERSIONS__ || key === __VERSION__) {
      continue
    }
    if (data.hasOwnProperty(key)) {
      // the version control for a field
      if (storeVersions[key] !== dataVersions[key]) {
        continue
      }
      // if the new version of the store skipped a field, will
      // not assign stored data to it. this method need to the
      // store init the field with a value.
      const desc = Object.getOwnPropertyDescriptor(store, key)
      if (desc && !desc.enumerable) {
        continue
      }
      const storeValue = store[key]
      const dataValue = data[key]
      if (isObservableArray(storeValue)) {
        // mobx array
        store[key] = observable.array(dataValue)
      } else if (isObservableMap(storeValue)) {
        // mobx map
        store[key] = observable.map(dataValue)
      } else if (isPrimitive(dataValue)) {
        // js/mobx primitive objects
        // this means a primitive object just like Date, RegExp, etc. will be
        // covert to string when use JSON.stringify, maybe need a decorator to
        // hook the setter to covert it to target format.
        store[key] = dataValue
      } else if (!storeValue) {
        // if store value is empty, assign persisted data to it directly
        store[key] = dataValue
      } else {
        // TODO check the storeValue is primitive to avoid ignore
        // the not initialized object field.
        // nested pure js object or mobx observable object
        parseStore(storeValue, dataValue)
      }
    }
  }
}

parseStore = action(parseStore)

export { parseStore }